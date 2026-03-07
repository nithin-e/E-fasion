import http from 'http';
import app from './app';
import { env } from './config/env';
import connectDB from './config/db';
import { initSocket } from './sockets/socketManager';
import { logger } from './utils/logger';

const server = http.createServer(app);
initSocket(server);

const start = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    logger.info(`🚀 Suruchi Fashion API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
};

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
  shutdown('unhandledRejection');
});

start();
