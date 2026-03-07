import Joi from 'joi';

export const checkoutValidation = Joi.object({
  addressId: Joi.string().hex().length(24).required(),
  paymentMethod: Joi.string().valid('onlinepay', 'cod').required(),
});

export const verifyPaymentValidation = Joi.object({
  razorpayOrderId: Joi.string().required(),
  razorpayPaymentId: Joi.string().required(),
  razorpaySignature: Joi.string().required(),
});

export const updateOrderStatusValidation = Joi.object({
  status: Joi.string()
    .valid('pending', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned')
    .required(),
});
