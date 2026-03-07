import { Request, Response, NextFunction } from 'express';
import { Address } from '../models/addressModel';
import { assertWithinDeliveryZone } from '../services/geoService';
import { HTTP } from '../utils/statuscodes';
import { AppError } from '../middlewares/errorMiddleware';

export const getAddresses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const addresses = await Address.find({ userId: req.user!._id, is_deleted: false });
    res.status(HTTP.OK).json({ success: true, addresses });
  } catch (err) { next(err); }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { lat, lng } = req.body;
    assertWithinDeliveryZone(lat, lng); // Throws if outside radius

    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user!._id }, { isDefault: false });
    }

    const address = await Address.create({ ...req.body, userId: req.user!._id });
    res.status(HTTP.CREATED).json({ success: true, address });
  } catch (err) { next(err); }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user!._id });
    if (!address) { next(new AppError('Address not found', HTTP.NOT_FOUND)); return; }
    address.is_deleted = true;
    await address.save();
    res.status(HTTP.OK).json({ success: true, message: 'Address removed' });
  } catch (err) { next(err); }
};
