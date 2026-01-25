const express = require('express');
const router = express.Router();
const User = require('../model/user.model');

// GET /api/admin/customers - get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' }, 'id name email isEmailVerified status createdAt');
    res.json({ customers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/admin/customers/:id - get a single customer by id
router.get('/:id', async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' }, 'id name email');
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// PATCH /api/admin/customers/:id/status - update customer status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'customer' },
      { status },
      { new: true }
    );
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update customer status' });
  }
});

// DELETE /api/admin/customers/:id - remove a customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

module.exports = router;
