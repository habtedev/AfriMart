
const Joi = require("joi");

// ArifPay payment validation schema
const arifpayPaymentSchema = Joi.object({
  phone: Joi.string().pattern(/^2519\d{8}$/).required().messages({
    'string.pattern.base': 'Phone number must be a valid Ethiopian number starting with 2519',
  }),
  orderId: Joi.string().min(3).max(64).required(),
  description: Joi.string().max(256).optional(),
});

function validateArifpayPayment(data) {
  return arifpayPaymentSchema.validate(data, { abortEarly: false });
}


// Carousel image validation schema
const carouselSchema = Joi.object({
  src: Joi.string().uri().required(),
  alt: Joi.string().allow("").optional(),
});

function validateCarousel(data) {
  return carouselSchema.validate(data);
}

// User registration validation schema
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

function validateRegister(data) {
  return registerSchema.validate(data);
}

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

function validateLogin(data) {
  return loginSchema.validate(data);
}


// Telebirr payment validation schema
const telebirrPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  phone: Joi.string()
    .pattern(/^2519\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Ethiopian number starting with 2519',
    }),
  orderId: Joi.string().min(3).max(64).required(),
  description: Joi.string().max(256).optional(),
  // Add more fields as needed for Telebirr compliance
});

function validateTelebirrPayment(data) {
  return telebirrPaymentSchema.validate(data, { abortEarly: false });
}

// Chapa payment validation schema
const chapaPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).required(),
  email: Joi.string().email().required(),
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  tx_ref: Joi.string().min(3).max(64).required(),
  callback_url: Joi.string().uri().required(),
  return_url: Joi.string().uri().optional(),
  customization_title: Joi.string().optional(),
  custom_description: Joi.string().optional(),
  custom_logo: Joi.string().uri().optional(),
});

function validateChapaPayment(data) {
  return chapaPaymentSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validateCarousel,
  validateRegister,
  validateLogin,
  validateTelebirrPayment,
  validateArifpayPayment,
  validateChapaPayment,
  chapaPaymentSchema,
};
