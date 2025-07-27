import { Pool } from 'pg';
import { DATABASE_URL } from '../config/config';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = async <T>(
  text: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number | null }> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
};

export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method
 client.query = ((...args: Parameters<typeof query>) => {
  clearTimeout(timeout);
  return query.apply(client, args);
}) as typeof query;

  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };

  return client;
};