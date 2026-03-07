import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const sendOtpValidation = Joi.object({
  mobile: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile must be exactly 10 digits',
      'string.empty': 'Mobile number is required',
    }),
});

export const verifyOtpValidation = Joi.object({
  mobile: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required(),
  code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP must be 6 digits',
    }),
});

export const completeSignupValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(60)
    .pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Name must only contain letters and spaces',
    }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
});

export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.pattern.base': 'New password must follow complexity rules',
    }),
});
