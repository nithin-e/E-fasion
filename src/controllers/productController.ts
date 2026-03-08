import { Request, Response, NextFunction } from 'express';
import * as productService from '../services/productService';
import { Category } from '../models/categoryModel';
import { HTTP } from '../utils/statuscodes';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, category, brand, minPrice, maxPrice, color, discount, rating, sort, page, limit } = req.query;
    const result = await productService.listProducts({
      q: q as string,
      category: category as string,
      brand: brand as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      color: color as string,
      discount: discount ? parseFloat(discount as string) : undefined,
      rating: rating ? parseFloat(rating as string) : undefined,
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

export const getProductRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const productId = req.params.id;
    const currentProduct = await productService.getProductById(productId);
    
    // Find products in same category or brand, excluding current one
    const categoryQuery = (currentProduct.category as any)?.slug || currentProduct.category?.toString();
    const recommendations = await productService.listProducts({
       category: categoryQuery,
       limit: 10
    });
    
    // Filter out the current product from recommendations if it appeared
    const filtered = recommendations.products.filter(p => p._id.toString() !== productId);
    
    res.status(HTTP.OK).json({ success: true, recommendations: filtered.slice(0, 10) });
  } catch (err) { next(err); }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ is_deleted: false }).sort({ name: 1 });
    res.status(HTTP.OK).json({ success: true, categories });
  } catch (err) { next(err); }
};
