import mysql from 'mysql2/promise';

const ALLOWED_DBS = new Set(['northwind', 'hr', 'world', 'airport']);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, database = 'northwind' } = req.body || {};
  if (!query) return res.status(400).json({ error: 'Query required' });
  if (!ALLOWED_DBS.has(database)) return res.status(403).json({ error: `Database "${database}" not allowed` });

  const trimmed = query.trim().replace(/\/\*[\s\S]*?\*\//g, '').replace(/--[^\n]*/g, '').trim();
  const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
  if (!['SELECT', 'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN', 'WITH'].includes(firstWord)) {
    return res.status(403).json({ error: 'Only SELECT / SHOW / DESCRIBE queries are allowed' });
  }

  const user = (process.env.TIDB_USER || '').trim();
  const password = (process.env.TIDB_PASSWORD || '').trim();
  const host = (process.env.TIDB_HOST || '').trim();
  const port = parseInt((process.env.TIDB_PORT || '4000').trim());

  let conn;
  try {
    conn = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      ssl: { rejectUnauthorized: false },
      connectTimeout: 15000,
    });
    const [rows, fields] = await conn.execute(query);
    const columns = fields.map(f => f.name);
    return res.status(200).json({ columns, rows });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      debug: { host: host.slice(0, 10), user: user.slice(0, 10), port }
    });
  } finally {
    if (conn) await conn.end();
  }
}
