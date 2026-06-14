import { MongoClient } from 'mongodb';

const ALLOWED_DBS = new Set(['ich', 'sample_airbnb', 'sample_restaurants', 'Bank_gitHub', 'sample_mflix']);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    database,
    collection,
    operation,
    filter = {},
    pipeline = [],
    sort,
    limit = 50,
    projection,
  } = req.body || {};

  if (!ALLOWED_DBS.has(database)) return res.status(403).json({ error: 'Database not allowed' });
  if (!collection) return res.status(400).json({ error: 'collection required' });
  if (!['find', 'aggregate', 'countDocuments'].includes(operation)) {
    return res.status(403).json({ error: 'Operation not allowed' });
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const col = client.db(database).collection(collection);
    let result;

    if (operation === 'find') {
      let cursor = col.find(filter, { projection: projection || {} });
      if (sort) cursor = cursor.sort(sort);
      cursor = cursor.limit(Math.min(Number(limit), 100));
      result = await cursor.toArray();
    } else if (operation === 'aggregate') {
      const hasLimit = pipeline.some(s => '$limit' in s);
      const safe = hasLimit ? pipeline : [...pipeline, { $limit: 100 }];
      result = await col.aggregate(safe).toArray();
    } else if (operation === 'countDocuments') {
      result = [{ count: await col.countDocuments(filter) }];
    }

    return res.status(200).json({ docs: result });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  } finally {
    await client.close();
  }
}
