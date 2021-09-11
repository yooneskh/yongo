import { MongoClient } from '../deps.ts';


const yonnectionsMap: Map<string, Yonnection> = new Map();


export class Yonnection {

  private client: MongoClient | undefined;

  constructor(private connectionString: string, private name?: string) {

    if (yonnectionsMap.has(name ?? '__default')) {
      throw new Error(`connection is already used ${name ?? 'default'}`);
    }

  }

  public async connect() {
    try {
      this.client = new MongoClient();
      await this.client.connect(this.connectionString);
      yonnectionsMap.set(this.name ?? '__default', this);
    }
    catch (error) {
      this.client = undefined;
      throw error;
    }
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('client is not connected.');
    }

    return this.client;

  }

  public disconnect() {
    this.client?.close();
    yonnectionsMap.delete(this.name ?? '__default');
  }

}


export function getYonnection(name?: string): Yonnection {
  if (!yonnectionsMap.has(name ?? '__default')) {
    throw new Error(`${name ?? 'default'} connection has not been made.`);
  }

  return yonnectionsMap.get(name ?? '__default')!;

}

export function getDefaultYonnection() {
  return getYonnection();
}
