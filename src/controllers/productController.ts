import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { Category } from '../models/categoryModel';
import { HTTP } from '../utils/statuscodes';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, category, sort, page, limit } = req.query;
    const result = await productService.listProducts({
      q: q as string,
      category: category as string,
      sort: sort as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.status(HTTP.OK).json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await productService.getProductById(req.params.id as string);
    res.status(HTTP.OK).json({ success: true, product });
  } catch (err) { next(err); }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ is_deleted: false }).sort({ name: 1 });
    res.status(HTTP.OK).json({ success: true, categories });
  } catch (err) { next(err); }
};
