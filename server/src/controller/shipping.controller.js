const ShippingAddress = require('../model/shippingAddress.model');

// Create or update shipping address for a user
exports.saveShippingAddress = async (req, res, next) => {
  try {
    const { fullName, address, city, postalCode, country, phone } = req.body;
    const userId = req.user.id;
    let shipping = await ShippingAddress.findOne({ user: userId });
    if (shipping) {
      shipping.fullName = fullName;
      shipping.address = address;
      shipping.city = city;
      shipping.postalCode = postalCode;
      shipping.country = country;
      shipping.phone = phone;
      await shipping.save();
    } else {
      shipping = await ShippingAddress.create({
        user: userId,
        fullName,
        address,
        city,
        postalCode,
        country,
        phone,
      });
    }
    res.status(200).json({ message: 'Shipping address saved', shipping });
  } catch (err) {
    next(err);
  }
};

// Get shipping address for a user
exports.getShippingAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const shipping = await ShippingAddress.findOne({ user: userId });
    if (!shipping) return res.status(404).json({ message: 'No shipping address found' });
    res.json(shipping);
  } catch (err) {
    next(err);
  }
};
