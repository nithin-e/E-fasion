import { FilterQuery } from 'mongoose';
import { Product } from '../models/productModel';
import { IProduct } from '../types';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';

interface ProductQuery {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const listProducts = async (query: ProductQuery) => {
  const { q, category, sort, page = 1, limit = 20 } = query;
  const filter: FilterQuery<IProduct> = { is_deleted: false };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;

  let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { basePrice: 1 };
  else if (sort === 'price_desc') sortOption = { basePrice: -1 };
  else if (sort === 'newest') sortOption = { createdAt: -1 };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate({ path: 'variants', match: { is_deleted: false } })
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total, page, pages: Math.ceil(total / limit) };
};

export const getProductById = async (id: string) => {
  const product = await Product.findOne({ _id: id, is_deleted: false })
    .populate('category', 'name slug')
    .populate({ path: 'variants', match: { is_deleted: false } });

  if (!product) throw new AppError('Product not found', HTTP.NOT_FOUND);
  return product;
};
