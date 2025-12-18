const Joi = require("joi");

// Carousel image validation schema
const carouselSchema = Joi.object({
  src: Joi.string().uri().required(),
  alt: Joi.string().allow("").optional(),
});

function validateCarousel(data) {
  return carouselSchema.validate(data);
}

module.exports = { validateCarousel };
