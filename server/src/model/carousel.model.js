const mongoose = require("mongoose");

const carouselSchema = new mongoose.Schema({
  src: { type: String, required: true },
  alt: { type: String },
  
}, { timestamps: true });

module.exports = mongoose.model("Carousel", carouselSchema);
