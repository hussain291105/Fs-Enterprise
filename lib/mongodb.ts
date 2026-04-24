import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGO_URL) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGO_URL;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise!;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Test connection
async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    throw error;
  }
}

// Initialize connection on startup
testConnection();

export default clientPromise;
