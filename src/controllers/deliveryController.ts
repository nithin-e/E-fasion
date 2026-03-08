import { Request, Response, NextFunction } from 'express';
import { HTTP } from '../utils/statuscodes';

import { env } from '../config/env';

// predefined central point (From ENV)
const BANGALORE_CENTER = { lat: env.WAREHOUSE_LAT, lng: env.WAREHOUSE_LNG };
const MAX_SERVICEABLE_RADIUS_KM = env.DELIVERY_RADIUS_KM;

function calculateDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

export const checkServiceable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Latitude and Longitude are required' });
      return;
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.status(HTTP.BAD_REQUEST).json({ success: false, message: 'Invalid coordinates' });
      return;
    }

    const distance = calculateDistanceKM(latitude, longitude, BANGALORE_CENTER.lat, BANGALORE_CENTER.lng);
    const isServiceable = distance <= MAX_SERVICEABLE_RADIUS_KM;

    res.status(HTTP.OK).json({
      success: true,
      isServiceable,
      distanceKM: parseFloat(distance.toFixed(2)),
      message: isServiceable ? 'Location is serviceable' : 'Oops! Blinkit is not available at this location at the moment.',
    });
  } catch (err) {
    next(err);
  }
};
