import { Pool, type PoolClient, type QueryResultRow } from 'pg';

const globalForPool = globalThis as unknown as { __corpGiftPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Configure the PostgreSQL connection before starting the application.'
    );
  }
  return new Pool({ connectionString, max: 5 });
}

export function getPool(): Pool {
  if (!globalForPool.__corpGiftPool) {
    globalForPool.__corpGiftPool = createPool();
  }
  return globalForPool.__corpGiftPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as never[]);
  return result.rows;
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
