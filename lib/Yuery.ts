// deno-lint-ignore-file no-explicit-any

import { deepMerge, Database, Collection, ObjectId } from '../deps.ts';
import { Yonnection, getDefaultYonnection } from './Yonnection.ts';


export class Yuery {

  private yonnection: Yonnection;
  private filters: any = {};
  private sorts: any = {};
  private payload: any = {};
  private populates: any = {};
  private limit: number | undefined;
  private skip: number | undefined;

  private database: Database;
  private collection: Collection<unknown>;

  constructor(collectionName: string, yonnection?: Yonnection) {
    this.yonnection = yonnection ?? getDefaultYonnection();
    this.database = this.yonnection.getClient().database();
    this.collection = this.database.collection(collectionName);
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


  public with(query: any) {
    this.filters = deepMerge(this.filters, query);
  }

  public sort(sort: any) {
    this.sorts = deepMerge(this.sorts, sort);
  }

  public put(key: string, value: any) {
    this.payload[key] = value;
  }

  public populate(path: string, fields?: string) {
    this.populates[path] = fields ?? '';
  }


  public query(): Promise<any[]> {

    const query = this.collection.find(this.filters);

    query.sort(this.sorts);
    if (this.limit) query.limit(this.limit);
    if (this.skip) query.skip(this.skip);

    return query.toArray();

  }

  public queryOne(): Promise<any> {
    return this.collection.findOne(this.filters);
  }

  public count(): Promise<number> {
    return this.collection.countDocuments(this.filters);
  }

  public async insert(): Promise<any> {
    const id = await this.collection.insertOne(this.getNormalizedPayload());
    return this.collection.findOne({ _id: id }); // todo: check if payload itself has all ids
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
