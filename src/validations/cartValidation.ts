import Joi from 'joi';

export const addCartItemValidation = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  variantId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

export const updateCartQtyValidation = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export const applyCouponValidation = Joi.object({
  code: Joi.string().uppercase().trim().required(),
});
