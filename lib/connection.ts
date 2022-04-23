import { MongoClient } from '../deps.ts';
import { connectionLocks } from '../util/connection-locks.ts';


const connectionsMap: Map<string, Connection> = new Map();

const DEFAULT_CONNECTION_KEY = '__default';


export class Connection {

  private client: MongoClient | undefined;

  constructor(private connectionString: string, private name?: string) {
    if (connectionsMap.has(name ?? DEFAULT_CONNECTION_KEY)) {
      throw new Error(`connection is already used ${name ?? 'default'}`);
    }
  }

  public async connect() {
    try {

      connectionLocks.get(this.name ?? DEFAULT_CONNECTION_KEY).lock();

      this.client = new MongoClient();
      await this.client.connect(this.connectionString);

      connectionsMap.set(this.name ?? DEFAULT_CONNECTION_KEY, this);
      connectionLocks.get(this.name ?? DEFAULT_CONNECTION_KEY).unlock();

    }
    catch (error) {

      this.client = undefined;
      connectionLocks.get(this.name ?? DEFAULT_CONNECTION_KEY).unlock();

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
    connectionsMap.delete(this.name ?? DEFAULT_CONNECTION_KEY);
  }

}


export async function getConnection(name?: string): Promise<Connection> {

  await connectionLocks.get(name ?? DEFAULT_CONNECTION_KEY).knock();

  if (!connectionsMap.has(name ?? DEFAULT_CONNECTION_KEY)) {
    throw new Error(`${name ?? 'default'} connection has not been made.`);
  }

  return connectionsMap.get(name ?? DEFAULT_CONNECTION_KEY)!;

}

export function getDefaultConnection() {
  return getConnection();
}

export function connect(connectionString: string) {
  return new Connection(connectionString).connect();
}
