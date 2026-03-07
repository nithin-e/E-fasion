import { FilterQuery } from 'mongoose';
import { Product } from '../models/productModel';
import { IProduct } from '../types';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';

interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  color?: string | string[];
  discount?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export const listProducts = async (query: ProductQuery) => {
  const { q, category, brand, minPrice, maxPrice, color, discount, rating, sort, page = 1, limit = 20 } = query;
  const filter: any = { is_deleted: false };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  
  if (brand) {
    if (Array.isArray(brand)) filter.brand = { $in: brand };
    else filter.brand = brand;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.basePrice = {};
    if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
    if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
  }

  if (discount) filter.discount = { $gte: discount };
  if (rating) filter.avgRating = { $gte: rating };

  // Color filtering (requires matching in variants)
  let variantFilter: any = { is_deleted: false };
  if (color) {
    if (Array.isArray(color)) variantFilter.shadeName = { $in: color.map(c => new RegExp(c, 'i')) };
    else variantFilter.shadeName = new RegExp(color as string, 'i');
  }

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { basePrice: 1 };
  else if (sort === 'price_desc') sortOption = { basePrice: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };
  else if (sort === 'rating') sortOption = { avgRating: -1 };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name logo')
      .populate({ path: 'variants', match: variantFilter })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  // If color was specified, filter out products that don't have matching variants
  let filteredProducts = products;
  if (color) {
    filteredProducts = products.filter(p => p.variants && p.variants.length > 0);
  }

  return { 
    products: filteredProducts, 
    total: color ? filteredProducts.length : total, 
    page, 
    pages: Math.ceil((color ? filteredProducts.length : total) / limit) 
  };
};

export const getProductById = async (id: string) => {
  const product = await Product.findOne({ _id: id, is_deleted: false })
    .populate('category', 'name slug')
    .populate({ path: 'variants', match: { is_deleted: false } });

  if (!product) throw new AppError('Product not found', HTTP.NOT_FOUND);
  return product;
};
