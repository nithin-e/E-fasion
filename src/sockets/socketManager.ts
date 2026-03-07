import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { registerDeliveryTracker } from './deliveryTracker';
import { logger } from '../utils/logger';

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: { origin: env.CLIENT_URL, methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    registerDeliveryTracker(io, socket);
    socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
