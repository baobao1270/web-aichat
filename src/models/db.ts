import { getServerEnv } from '@/server-env';
import { Db, MongoClient } from 'mongodb';

export interface DbContext {
    client: MongoClient;
    db: Db;
}

export async function connectDb(): Promise<DbContext> {
    const uri = getServerEnv().MONGODB_URI;
    const client = new MongoClient(uri);
    const db = client.db();
    return { client, db };
}
