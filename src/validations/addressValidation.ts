import Joi from 'joi';

export const addAddressValidation = Joi.object({
  fullName: Joi.string().min(2).max(60).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  houseName: Joi.string().min(1).max(100).required(),
  locality: Joi.string().min(2).max(100).required(),
  city: Joi.string().min(2).max(60).required(),
  state: Joi.string().min(2).max(60).required(),
  pincode: Joi.string().pattern(/^[0-9]{6}$/).required(),
  lat: Joi.number().required(),
  lng: Joi.number().required(),
  isDefault: Joi.boolean().default(false),
});
