const PaymentMethod = require('../model/paymentMethod.model');

// Add or update a payment method for a user
exports.savePaymentMethod = async (req, res, next) => {
  try {
    const { type, cardNumber, cardHolder, expiry, cvc, paypalEmail, bankAccount, mobileNumber, telebirrAccount, mpesaAccount, cbeBirrAccount } = req.body;
    const userId = req.user.id;
    let payment = await PaymentMethod.findOne({ user: userId, type });
    if (payment) {
      payment.cardNumber = cardNumber;
      payment.cardHolder = cardHolder;
      payment.expiry = expiry;
      payment.cvc = cvc;
      payment.paypalEmail = paypalEmail;
      payment.bankAccount = bankAccount;
      payment.mobileNumber = mobileNumber;
      payment.telebirrAccount = telebirrAccount;
      payment.mpesaAccount = mpesaAccount;
      payment.cbeBirrAccount = cbeBirrAccount;
      await payment.save();
    } else {
      payment = await PaymentMethod.create({
        user: userId,
        type,
        cardNumber,
        cardHolder,
        expiry,
        cvc,
        paypalEmail,
        bankAccount,
        mobileNumber,
        telebirrAccount,
        mpesaAccount,
        cbeBirrAccount,
      });
    }
    res.status(200).json({ message: 'Payment method saved', payment });
  } catch (err) {
    next(err);
  }
};

// Get all payment methods for a user
exports.getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const payments = await PaymentMethod.find({ user: userId });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};
