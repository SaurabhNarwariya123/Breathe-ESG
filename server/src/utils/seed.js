const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');
const Tenant = require('../models/Tenant');

const seed = async () => {
  await connectDB();

  let tenant = await Tenant.findOne({ slug: 'acme-corp' });
  if (!tenant) {
    tenant = await Tenant.create({ name: 'Acme Corp', slug: 'acme-corp' });
    console.log('Tenant created:', tenant.name);
  }

  const exists = await User.findOne({ email: 'analyst@acme.com' });
  if (!exists) {
    await User.create([
      { name: 'Alice Analyst', email: 'analyst@acme.com', password: 'Password123', role: 'analyst', tenantId: tenant._id },
      { name: 'Admin User', email: 'admin@acme.com', password: 'Password123', role: 'admin', tenantId: tenant._id },
    ]);
    console.log('Seed users created: analyst@acme.com / admin@acme.com (Password123)');
  } else {
    console.log('Seed data already exists');
  }

  process.exit(0);
};

seed().catch((e) => { console.error(e); process.exit(1); });
