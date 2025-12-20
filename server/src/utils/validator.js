const Joi = require("joi");


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
  password: Joi.string().min(6).max(128).required(),
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

module.exports = { validateCarousel, validateRegister, validateLogin };
