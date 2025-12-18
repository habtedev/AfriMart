const Carousel = require("../model/carousel.model");
const { validateCarousel } = require("../utils/validator");

// Get all carousel images
exports.getAllCarousel = async (req, res) => {
  try {
    const images = await Carousel.find();
    res.status(200).json({"message": "successful image fetch", images});
  } catch (err) {
    res.status(500).json({ "message":"Internal server error", error: err.message });
  }
};

// Add a new carousel image (with file upload)
exports.addCarousel = async (req, res) => {
  try {
    // get image path from multer middleware
    let src = req.body.src;
    if (req.file && req.file.path) {
      src = req.file.path; // Cloudinary URL
    }
     
    // validation inputs
    const { alt } = req.body;
    const { error } = validateCarousel({ src, alt });
    if (error) return res.status(400).json({ error: error.details[0].message });

    // create and save images 
    const image = new Carousel({ src, alt });
    await image.save();
    res.status(201).json({"message": "successful image addition", image});
  } catch (err) {
    res.status(500).json({ "message":"Internal server error", error: err.message });
  }
};

// Update a carousel image
exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const { src, alt } = req.body;

    //validation inputs
    const { error } = validateCarousel({ src, alt });
    if (error) return res.status(400).json({ error: error.details[0].message });

    //find and update images 
    const image = await Carousel.findByIdAndUpdate(id, { src, alt }, { new: true });
    if (!image) return res.status(404).json({ error: "Not found" });
    res.status(200).json({"message": "successful image update", image});
  } catch (err) {
    res.status(500).json({ "message":"Internal server error", error: err.message });
  }
};

// Delete a carousel image
exports.deleteCarousel = async (req, res) => {
  try {
    // validation inputs
    const { id } = req.params;
    const image = await Carousel.findByIdAndDelete(id);
    if (!image) return res.status(404).json({ error: "Not found" });

    //Deleted sucessfully
    res.status(200).json({ "message": "successful image deletion" });
  } catch (err) {
    res.status(500).json({ "message":"Internal server error", error: err.message });
  }
};
