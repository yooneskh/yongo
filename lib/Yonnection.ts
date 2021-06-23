import { MongoClient } from '../deps.ts';

let client: MongoClient | undefined;
let databaseName: string | undefined;

export async function connect(host: string, port: string, database: string) {
  try {
    client = new MongoClient();
    await client.connect(`mongo://${host}:${port}/${database}`);
    databaseName = database;
  }
  catch (error) {
    client = undefined;
    throw error;
  }
}

export function getDatabaseName(): string {
  if (!client) throw new Error('client not connected yet.');
  return databaseName!;
}

export function getClient(): MongoClient {
  if (!client) throw new Error('client not connected yet.');
  return client;
}
