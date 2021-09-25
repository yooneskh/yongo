import { MongoClient } from '../deps.ts';


const connectionsMap: Map<string, Connection> = new Map();


export class Connection {

  private client: MongoClient | undefined;

  constructor(private connectionString: string, private name?: string) {

    if (connectionsMap.has(name ?? '__default')) {
      throw new Error(`connection is already used ${name ?? 'default'}`);
    }

  }

  public async connect() {
    try {
      this.client = new MongoClient();
      await this.client.connect(this.connectionString);
      connectionsMap.set(this.name ?? '__default', this);
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
    connectionsMap.delete(this.name ?? '__default');
  }

}


export function getConnection(name?: string): Connection {
  if (!connectionsMap.has(name ?? '__default')) {
    throw new Error(`${name ?? 'default'} connection has not been made.`);
  }

  return connectionsMap.get(name ?? '__default')!;

}

export function getDefaultConnection() {
  return getConnection();
}

export function connect(connectionString: string) {
  return new Connection(connectionString).connect();
}
