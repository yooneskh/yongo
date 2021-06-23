import { getDatabaseName, getClient } from './Yonnection.ts';
import { plural, Bson } from '../deps.ts';

export interface IDocumentProperties {
  // deno-lint-ignore no-explicit-any
  _id: any;
}

export class Yodel<T> {

  // private database = undefined;
  // private collection = undefined;

  constructor(private name: string) { }

  private getDatabase() {

    // if (this.database) return this.database!;
    // this.database = getClient().database(getDatabaseName());
    // return this.database!;

    return getClient().database(getDatabaseName());

  }

  private getCollection() {

    // if (this.collection) return this.collection!;
    // this.collection = this.getDatabase().collection<T>(plural(this.name));
    // return this.collection!;

    return this.getDatabase().collection<T & IDocumentProperties>(plural(this.name));

  }

  // deno-lint-ignore no-explicit-any
  find(filter?: any) {
    return this.getCollection().find(filter).toArray();
  }

  // deno-lint-ignore no-explicit-any
  findById(id: any) {
    return this.getCollection().findOne({
      _id: new Bson.ObjectID(id)
    });
  }

  // deno-lint-ignore no-explicit-any
  findOne(filter: any) {
    return this.getCollection().findOne(filter);
  }

  // deno-lint-ignore no-explicit-any
  count(filter: any) {
    return this.getCollection().count(filter);
  }

  async create(document: T) {
    const id = await this.getCollection().insertOne(document);
    return this.findById(id) as Promise<T & IDocumentProperties>;
  }

  // deno-lint-ignore no-explicit-any
  async updateById(id: any, updates: Partial<T>) {

    await this.getCollection().updateOne(
      {
        _id: new Bson.ObjectID(id)
      },
      {
        $set: updates
      },
      {
        upsert: false
      }
    );

    if (!id) return undefined;
    return this.findById(id);

  }

  // deno-lint-ignore no-explicit-any
  async updateOne(filter: any, updates: Partial<T>) {

    const document = await this.findOne(filter);
    if (!document) return undefined;

    return this.updateById(document._id, updates);

  }

  // deno-lint-ignore no-explicit-any
  async updateMany(filter: any, updates: Partial<T>) {

    const documents = await this.find(filter);

    return await Promise.all(
      documents.map(it =>
        this.updateById(it._id, updates)
      )
    );

  }

  // deno-lint-ignore no-explicit-any
  deleteById(id: any) {
    return this.getCollection().deleteOne({
      _id: new Bson.ObjectID(id)
    });
  }

  // deno-lint-ignore no-explicit-any
  deleteOne(filter: any) {
    return this.getCollection().deleteOne(filter);
  }

  // deno-lint-ignore no-explicit-any
  deleteMany(filter: any) {
    return this.getCollection().deleteMany(filter);
  }

}
