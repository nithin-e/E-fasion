import { env } from '../config/env';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';

// Haversine formula — distance in km between two lat/lng points
export const haversineDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const assertWithinDeliveryZone = (lat: number, lng: number): void => {
  const dist = haversineDistance(env.WAREHOUSE_LAT, env.WAREHOUSE_LNG, lat, lng);
  if (dist > env.DELIVERY_RADIUS_KM) {
    throw new AppError(
      `Delivery is not available in your location. We currently deliver within ${env.DELIVERY_RADIUS_KM} km.`,
      HTTP.BAD_REQUEST
    );
  }
};
