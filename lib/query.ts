// deno-lint-ignore-file no-explicit-any

import { deepMerge, Database, Collection, ObjectId, Lock } from '../deps.ts';
import { Connection, getConnection } from './connection.ts';
import { traverseObject } from './util.ts';


export interface IQueryPopulate {
  path: string;
  collection: string;
  fields?: string;
}


export class Query<T> {

  private connection?: Connection;
  private filters: any = {};
  private sorts: any = {};
  private selects: any = {};
  private payload: any = {};
  private populates: IQueryPopulate[] = [];
  private limit: number | undefined;
  private skip: number | undefined;

  private database?: Database;
  private collection?: Collection<T>;

  private connectionMadeLock = new Lock();


  constructor(private collectionName: string, private connectionName?: string) {
    this.setupConnection();
  }

  private async setupConnection() {
    try {

      this.connectionMadeLock.lock();

      this.connection = await getConnection(this.connectionName);

      this.database = this.connection.getClient().database();
      this.collection = this.database.collection<T>(this.collectionName);

      this.connectionMadeLock.unlock();

    }
    catch (error) {

      this.connection?.disconnect();
      this.connection = undefined;
      this.database = undefined;
      this.collection = undefined;

      this.connectionMadeLock.unlock();

      throw error;

    }
  }

  private async ensureConnection() {
    await this.connectionMadeLock.knock();
  }


  private normalizeObject(object: any) {
    for (const value of Object.values(object)) {
      if (Array.isArray(value)) {

        for (const arrayItem of value) {
          if (typeof arrayItem === 'object' && !Array.isArray(arrayItem) && arrayItem !== null) {

            if (!arrayItem._id) {
              arrayItem._id = new ObjectId();
            }

            this.normalizeObject(arrayItem);

          }
        }

      }
    }
  }

  private getNormalizedPayload() {
    const payload = JSON.parse(JSON.stringify(this.payload));
    this.normalizeObject(payload);
    return payload;
  }

  private normalizeIdValue(value: unknown): any {
    if (value === null || value === undefined || value instanceof ObjectId || !['string', 'object'].includes(typeof value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        return new ObjectId(value);
      }
      catch {
        return value;
      }
    }

    if (Array.isArray(value)) {
      return value.map(it => this.normalizeIdValue(it));
    }

    const valueObject = value as Record<string, unknown>;

    for (const key in valueObject) {
      valueObject[key] = this.normalizeIdValue(valueObject[key]);
    }

    return valueObject;

  }

  private normalizeFilters(filters: any) {

    traverseObject(filters, (key, value) => {
      if (key === '_id') {
        return this.normalizeIdValue(value);
      }
      else {
        return value;
      }
    });

    return filters;

  }

  private getNormalizedFilters() {
    return this.normalizeFilters(this.filters);
  }

  private async populateDocument(document: any, keyPrefix = '') {
    if (!document) return;

    await this.ensureConnection();

    for (const key of Object.keys(document)) {

      const populate = this.populates.find(it => it.path === (keyPrefix ? `${keyPrefix}.${key}` : key));

      if (!populate) {
        if (!document[key] || typeof document[key] !== 'object') continue;

        if (Array.isArray(document[key])) {
          for (const subdocument of document[key]) {
            // todo: prune if prefix does not exist in any populate
            await this.populateDocument(subdocument, keyPrefix ? `${keyPrefix}.${key}` : key);
          }
        }
        else {
          // todo: prune if prefix does not exist in any populate
          await this.populateDocument(document[key], keyPrefix ? `${keyPrefix}.${key}` : key)
        }

        continue;

      }

      if (Array.isArray(document[key])) {

        const query = new Query(populate.collection, this.connectionName);
        query.where({ _id: { $in: document[key].map((it: any) => it instanceof ObjectId ? it : new ObjectId(it)) }});
        document[key] = await query.query(); // todo: select only wanted fields

        if (document[key]) {
          await Promise.all(
            document[key].map((it: any) =>
              this.populateDocument(it, keyPrefix ? `${keyPrefix}.${key}` : key)
            )
          );
        }

      }
      else if (typeof document[key] === 'string' || document[key] instanceof ObjectId) {

        const query = new Query(populate.collection, this.connectionName);
        query.where({ _id: typeof document[key] === 'string' ? (new ObjectId(document[key])) : (document[key]) });
        document[key] = await query.queryOne(); // todo: select only wanted fields

        if (document[key]) {
          await this.populateDocument(document[key], keyPrefix ? `${keyPrefix}.${key}` : key);
        }

      }

    }

  }


  public where(query: any) {
    this.filters = deepMerge(this.filters, query);
  }

  public projectIn(key: string) {
    this.selects[key] = true;
  }

  public projectOut(key: string) {
    this.selects[key] = false;
  }

  public sort(sort: any) {
    this.sorts = deepMerge(this.sorts, sort);
  }

  public put(key: string, value: any) {
    this.payload[key] = value;
  }

  public populate(...populates: IQueryPopulate[]) {
    this.populates.push(...populates);
  }

  public skips(skip: number) {
    this.skip = skip;
  }

  public limits(limit: number) {
    this.limit = limit;
  }


  public async query(): Promise<T[]> {

    await this.ensureConnection();

    const query = this.collection!.find(this.getNormalizedFilters(), { projection: this.selects });

    query.sort(this.sorts);
    if (this.limit) query.limit(this.limit);
    if (this.skip) query.skip(this.skip);

    const documents = await query.toArray();

    await Promise.all(
      documents.map(it => this.populateDocument(it))
    );

    return documents;

  }

  public async queryOne(): Promise<T | undefined> {

    await this.ensureConnection();

    const document = await this.collection!.findOne(this.getNormalizedFilters(), { projection: this.selects });

    if (document) {
      await this.populateDocument(document);
    }

    return document;

  }

  public async count(): Promise<number> {
    await this.ensureConnection();
    return this.collection!.countDocuments(this.getNormalizedFilters());
  }

  public async insert(): Promise<T | undefined> {

    await this.ensureConnection();

    const id = await this.collection!.insertOne(this.getNormalizedPayload());
    return this.collection!.findOne({ _id: id }); // todo: check if payload itself has id

  }

  public async commitMany() {
    await this.ensureConnection();
    return this.collection!.updateMany(this.getNormalizedFilters(), { $set: this.getNormalizedPayload() } as any);
  }

  public async commit() {
    await this.ensureConnection();
    return this.collection!.updateOne(this.getNormalizedFilters(), { $set: this.getNormalizedPayload() } as any);
  }

  public async deleteMany() {
    await this.ensureConnection();
    return this.collection!.deleteMany(this.getNormalizedFilters());
  }

  public async delete() {
    await this.ensureConnection();
    return this.collection!.deleteOne(this.getNormalizedFilters());
  }

}
