const CustomerReview = require('../model/customerReview.model');
const cloudinary = require('../utils/cloudinary');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, photo } = req.body;
    const userId = req.user?._id || req.body.userId;
    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    let photoUrl = '';
    if (photo) {
      // photo can be a base64 string or file URL
      try {
        const uploadResult = await cloudinary.uploader.upload(photo, {
          folder: 'customer-reviews',
        });
        photoUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        return res.status(500).json({ error: 'Photo upload failed.' });
      }
    }

    const review = new CustomerReview({
      productId,
      userId,
      rating,
      comment,
      photo: photoUrl,
    });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review.' });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await CustomerReview.find({ productId }).populate('userId', 'name photo');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};
