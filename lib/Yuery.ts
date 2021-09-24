// deno-lint-ignore-file no-explicit-any

import { deepMerge, Database, Collection, ObjectId } from '../deps.ts';
import { Yonnection, getDefaultYonnection } from './Yonnection.ts';


export interface IYueryPopulate {
  path: string;
  collection: string;
  fields?: string;
}


export class Yuery<T> {

  private yonnection: Yonnection;
  private filters: any = {};
  private sorts: any = {};
  private payload: any = {};
  private populates: IYueryPopulate[] = [];
  private limit: number | undefined;
  private skip: number | undefined;

  private database: Database;
  private collection: Collection<T>;

  constructor(collectionName: string, yonnection?: Yonnection) {
    this.yonnection = yonnection ?? getDefaultYonnection();
    this.database = this.yonnection.getClient().database();
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

  private async populateDcoument(doucment: any, keyPrefix = '') {
    for (const key of Object.keys(doucment)) {

      const populate = this.populates.find(it => it.path === (!keyPrefix ? key : `${keyPrefix}.${key}`));
      if (!populate) continue;

      const query = new Yuery(populate.collection, this.yonnection);
      query.where({ _id: new ObjectId(doucment[key]) }); // todo: select only wanted fields
      doucment[key] = await query.queryOne();

      if (doucment[key]) {
        await this.populateDcoument(doucment[key], `${keyPrefix}.${key}`);
      }

    }
  }


  public where(query: any) {
    this.filters = deepMerge(this.filters, query);
  }

  public sort(sort: any) {
    this.sorts = deepMerge(this.sorts, sort);
  }

  public put(key: string, value: any) {
    this.payload[key] = value;
  }

  public populate(...populates: IYueryPopulate[]) {
    this.populates.push(...populates);
  }


  public async query(): Promise<T[]> {

    const query = this.collection.find(this.filters);

    query.sort(this.sorts);
    if (this.limit) query.limit(this.limit);
    if (this.skip) query.skip(this.skip);

    const documents = await query.toArray();

    await Promise.all(
      documents.map(it => this.populateDcoument(it))
    );

    return documents;

  }

  public async queryOne(): Promise<T | undefined> {

    const document = await this.collection.findOne(this.filters);

    await this.populateDcoument(document);
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
    return this.collection.updateMany(this.filters, this.getNormalizedPayload());
  }

  public commit() {
    return this.collection.updateOne(this.filters, this.getNormalizedPayload());
  }

  public deleteMany() {
    return this.collection.deleteMany(this.filters);
  }

  public delete() {
    return this.collection.deleteOne(this.filters);
  }

}
