import { Server, Socket } from 'socket.io';
import { Order } from '../models/orderModel';
import { logger } from '../utils/logger';

export const registerDeliveryTracker = (io: Server, socket: Socket): void => {
  // ── User / Flutter app: join an order room ──────────────────────────────────
  socket.on('join-order-tracking', async (orderId: string) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) return;
      socket.join(`order:${orderId}`);
      logger.info(`Socket ${socket.id} joined room order:${orderId}`);

      // Send last known agent location immediately
      if (order.deliveryAgentLocation?.coordinates) {
        const [lng, lat] = order.deliveryAgentLocation.coordinates;
        socket.emit('agent-location-updated', { latitude: lat, longitude: lng });
      }
    } catch (err) {
      logger.error('join-order-tracking error:', err);
    }
  });

  // ── Delivery agent: broadcast real-time location ────────────────────────────
  socket.on('update-agent-location', async (data: { orderId: string; latitude: number; longitude: number }) => {
    try {
      const { orderId, latitude, longitude } = data;
      await Order.findByIdAndUpdate(orderId, {
        deliveryAgentLocation: { type: 'Point', coordinates: [longitude, latitude] },
      });

      // Broadcast to all users watching this order
      io.to(`order:${orderId}`).emit('agent-location-updated', { latitude, longitude });
      logger.debug(`Location update for order ${orderId}: [${latitude}, ${longitude}]`);
    } catch (err) {
      logger.error('update-agent-location error:', err);
    }
  });

  // ── Admin / dispatch: change order status ────────────────────────────────────
  socket.on('update-order-status', async (data: { orderId: string; status: string }) => {
    try {
      await Order.findByIdAndUpdate(data.orderId, { orderStatus: data.status });
      io.to(`order:${data.orderId}`).emit('order-status-changed', { status: data.status });
    } catch (err) {
      logger.error('update-order-status error:', err);
    }
  });
};
