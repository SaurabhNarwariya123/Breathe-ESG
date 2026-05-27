const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { name, email, password, role, tenantName } = req.body;

    let tenant = await Tenant.findOne({ slug: tenantName.toLowerCase().replace(/\s+/g, '-') });
    if (!tenant) {
      tenant = await Tenant.create({
        name: tenantName,
        slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
      });
    }

    const user = await User.create({ name, email, password, role, tenantId: tenant._id });
    const token = signToken(user._id);

    res.status(201).json({ token, user: { id: user._id, name, email, role, tenant: tenant.name } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Email already registered' });
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('tenantId');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: user.tenantId?.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const me = (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    tenant: req.user.tenantId?.name,
  });
};

module.exports = { register, login, me };
