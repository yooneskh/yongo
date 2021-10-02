// deno-lint-ignore-file no-explicit-any

import { deepMerge, Database, Collection, ObjectId } from '../deps.ts';
import { Connection, getDefaultConnection } from './connection.ts';


export interface IQueryPopulate {
  path: string;
  collection: string;
  fields?: string;
}


export class Query<T> {

  private connection: Connection;
  private filters: any = {};
  private sorts: any = {};
  private selects: any = {};
  private payload: any = {};
  private populates: IQueryPopulate[] = [];
  private limit: number | undefined;
  private skip: number | undefined;

  private database: Database;
  private collection: Collection<T>;

  constructor(collectionName: string, connection?: Connection) {
    this.connection = connection ?? getDefaultConnection();
    this.database = this.connection.getClient().database();
    this.collection = this.database.collection<T>(collectionName);
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

  private async populateDocument(document: any, keyPrefix = '') {
    for (const key of Object.keys(document)) {

      const populate = this.populates.find(it => it.path === (!keyPrefix ? key : `${keyPrefix}.${key}`));
      if (!populate) continue;

      if (Array.isArray(document[key])) {

        const query = new Query(populate.collection, this.connection);
        query.where({ _id: { $in: document[key].map((it: any) => it instanceof ObjectId ? it : new ObjectId(it)) }});
        document[key] = await query.query(); // todo: select only wanted fields

        if (document[key]) {
          await Promise.all(
            document[key].map((it: any) =>
              this.populateDocument(it, !keyPrefix ? key : `${keyPrefix}.${key}`)
            )
          );
        }

      }
      else if (typeof document[key] === 'string' || document[key] instanceof ObjectId) {

        const query = new Query(populate.collection, this.connection);
        query.where({ _id: typeof document[key] === 'string' ? (new ObjectId(document[key])) : (document[key]) });
        document[key] = await query.queryOne(); // todo: select only wanted fields

        if (document[key]) {
          await this.populateDocument(document[key], !keyPrefix ? key : `${keyPrefix}.${key}`);
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

    const query = this.collection.find(this.filters, { projection: this.selects });

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

    const document = await this.collection.findOne(this.filters, { projection: this.selects });

    await this.populateDocument(document);
    return document;

  }

  public count(): Promise<number> {
    return this.collection.countDocuments(this.filters);
  }

  public async insert(): Promise<T | undefined> {
    const id = await this.collection.insertOne(this.getNormalizedPayload());
    return this.collection.findOne({ _id: id }); // todo: check if payload itself has id
  }

  public commitMany() {
    return this.collection.updateMany(this.filters, { $set: this.getNormalizedPayload() } as any);
  }

  public commit() {
    return this.collection.updateOne(this.filters, { $set: this.getNormalizedPayload() } as any);
  }

  public deleteMany() {
    return this.collection.deleteMany(this.filters);
  }

  public delete() {
    return this.collection.deleteOne(this.filters);
  }

}
