import Joi from 'joi';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(60)
    .pattern(/^[A-Za-z]+(?: [A-Za-z]+)*$/)
    .required()
    .messages({
      'string.pattern.base': 'Name must only contain letters and single spaces between words (no leading or trailing spaces)',
      'string.empty': 'Name cannot be empty',
    }),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: false } }) // Set to false to allow any TLD or true for strict
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  mobile: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Mobile must be exactly 10 digits',
    }),
  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(passwordPattern)
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character',
    }),
});

export const loginValidation = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
  }),
});

export const otpValidation = Joi.object({
  email: Joi.string().trim().email().required(),
  code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'OTP must contain only digits',
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
