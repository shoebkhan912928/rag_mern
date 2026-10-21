import { Client, TablesDB, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

export const tablesDB = new TablesDB(client);
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;
export const TABLE_ID = process.env.APPWRITE_TABLE_ID;
export { ID, Query };

console.log('Appwrite TablesDB initialized successfully ✅');