// deno-lint-ignore-file no-explicit-any
import { deepMerge, Database } from '../deps.ts';
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

  constructor(private collection: string, yonnection?: Yonnection) {
    this.yonnection = yonnection ?? getDefaultYonnection();
    this.database = this.yonnection.getClient().database();
  }


  public with(queryFragment: any) {
    this.filters = deepMerge(this.filters, queryFragment);
  }

  public sort(sortFragment: any) {
    this.sorts = deepMerge(this.sorts, sortFragment);
  }

  public put(key: string, value: any) {
    this.payload[key] = value;
  }

  public populate(path: string, fields?: string) {
    this.populates[path] = fields ?? '';
  }


  public query(): Promise<any[]> {

    const query = this.database.collection(this.collection).find(this.filters);

    query.sort(this.sorts);
    if (this.limit) query.limit(this.limit);
    if (this.skip) query.skip(this.skip);

    return query.toArray();

  }

  public queryOne(): Promise<any> {
    return this.database.collection(this.collection).findOne(this.filters);
  }

  public count(): Promise<number> {
    return this.database.collection(this.collection).countDocuments(this.filters);
  }

  public create(): Promise<any> {
    return this.database.collection(this.collection).insertOne(this.payload);
  }

  public commit() {
    return this.database.collection(this.collection).updateMany(this.filters, this.payload);
  }

  public commitOne() {
    return this.database.collection(this.collection).updateOne(this.filters, this.payload);
  }

  public delete() {
    return this.database.collection(this.collection).deleteMany(this.filters);
  }

  public deleteOne() {
    return this.database.collection(this.collection).deleteOne(this.filters);
  }

}
