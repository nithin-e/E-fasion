import Joi from 'joi';

// Helper for MongoDB ID validation
const objectId = Joi.string().hex().length(24);

export const addProductValidation = Joi.object({
  name: Joi.string().min(2).max(120).trim().required(),
  brand: Joi.string().min(1).max(80).trim().required(),
  description: Joi.string().min(10).max(2000).trim().required(),
  highlights: Joi.array().items(Joi.string().max(200)).max(20).default([]),
  category: objectId.required(),
  basePrice: Joi.number().positive().max(1000000).required(),
});

export const updateProductValidation = Joi.object({
  name: Joi.string().min(2).max(120).trim(),
  brand: Joi.string().min(1).max(80).trim(),
  description: Joi.string().min(10).max(2000).trim(),
  highlights: Joi.array().items(Joi.string().max(200)).max(20),
  category: objectId,
  basePrice: Joi.number().positive().max(1000000),
  is_deleted: Joi.boolean(),
});

export const addVariantValidation = Joi.object({
  size: Joi.string().trim().max(50).required(),
  shadeName: Joi.string().trim().max(50).optional(),
  shadeHex: Joi.string().trim().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  price: Joi.number().positive().max(1000000).required(),
  discountPrice: Joi.number().positive().less(Joi.ref('price')).optional(),
  stock: Joi.number().integer().min(0).max(100000).required(),
});

export const addCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(80).trim().required(),
  description: Joi.string().max(500).trim().optional(),
});

export const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(80).trim(),
  description: Joi.string().max(500).trim(),
  is_deleted: Joi.boolean(),
});

export const addCouponValidation = Joi.object({
  code: Joi.string().uppercase().alphanum().min(4).max(20).trim().required(),
  discount: Joi.number().min(1).max(100).required(),
  minPurchase: Joi.number().min(0).default(0),
  maxRedeemable: Joi.number().integer().min(1).max(100000).required(),
  expiresAt: Joi.date().greater('now').required(),
});
