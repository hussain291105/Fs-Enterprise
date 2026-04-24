import clientPromise from './mongodb';

// Get database instance
async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Get collection helper
async function getCollection(collectionName: string) {
  const db = await getDb();
  return db.collection(collectionName);
}

export default {
  getConnection: async () => {
    const db = await getDb();
    return {
      execute: async (query: string, params: any[] = []) => {
        // This is a compatibility layer for MySQL-style queries
        // In production, you should rewrite queries to use MongoDB operations directly
        const collection = db.collection('billing');
        
        if (query.includes('SELECT') && query.includes('WHERE id = ?')) {
          const doc = await collection.findOne({ id: Number(params[0]) });
          return [doc ? [doc] : []];
        }
        
        if (query.includes('SELECT') && query.includes('ORDER BY')) {
          const docs = await collection.find({}).sort({ bill_date: -1 }).toArray();
          return [docs];
        }
        
        if (query.includes('INSERT INTO billing')) {
          const result = await collection.insertOne({
            id: params[0],
            customer_name: params[1],
            phone_number: params[2],
            payment_mode: params[3],
            status: params[4],
            bill_date: params[5],
            gsm_number: params[6],
            description: params[7],
            quantity: params[8],
            price: params[9],
            total: params[10],
            subtotal: params[11]
          });
          return [{ insertId: result.insertedId }];
        }
        
        if (query.includes('DELETE FROM billing')) {
          await collection.deleteOne({ id: Number(params[0]) });
          return [{ affectedRows: 1 }];
        }
        
        return [];
      },
      beginTransaction: async () => {
        // MongoDB doesn't need explicit transactions for single operations
        // For multi-document transactions, you'd use session
        return;
      },
      commit: async () => {
        return;
      },
      rollback: async () => {
        return;
      },
      release: () => {}
    };
  },
  getCollection
};
