import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from '../scripts/seed';

dotenv.config();

let inMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (uriOverride?: string): Promise<typeof mongoose> => {
  const targetUri = uriOverride || process.env.MONGODB_URI || 'mongodb://localhost:27017/borrowback';

  try {
    // Attempt connecting to the configured URI
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[MongoDB] Connection failed: ${(error as Error).message}`);
      console.error(`[MongoDB] Production requires a valid MONGODB_URI connection string.`);
      throw error;
    }

    console.warn(`\n[MongoDB Warning] Could not reach MongoDB at: ${targetUri}`);
    console.log(`[MongoDB] Falling back to In-Memory MongoDB Server for local development...`);

    try {
      inMemoryServer = await MongoMemoryServer.create({
        instance: {
          launchTimeout: 120000,
        },
      });
      const memoryUri = inMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] In-memory database active at: ${memoryUri}`);

      // Seed development demo accounts and listings automatically
      console.log(`[MongoDB] Pre-populating demo data so BorrowBack is immediately usable...`);
      await seedDatabase();
      console.log(`[MongoDB] Development environment is ready!`);
      console.log(`[MongoDB] Note: To persist data across restarts, configure MONGODB_URI in server/.env with MongoDB Atlas or start a local MongoDB daemon.\n`);

      return conn;
    } catch (memError) {
      console.error(`[MongoDB] In-memory fallback failed: ${(memError as Error).message}`);
      throw error;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (inMemoryServer) {
    await inMemoryServer.stop();
    inMemoryServer = null;
  }
  console.log('[MongoDB] Disconnected.');
};
