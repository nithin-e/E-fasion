import { Request, Response } from 'express';
import { Banner } from '../models/bannerModel';
import { catchAsync } from '../utils';

export const getBanners = catchAsync(async (_req: Request, res: Response) => {
  const banners = await Banner.find({ isActive: true }).sort({ priority: -1 });
  res.json({ success: true, banners });
});
