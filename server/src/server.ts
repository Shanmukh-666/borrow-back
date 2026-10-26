import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB, disconnectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[BorrowBack Server] Running on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
      console.log(`[BorrowBack Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    const shutdown = async () => {
      console.log('\n[BorrowBack Server] Shutting down gracefully...');
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[BorrowBack Server] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
