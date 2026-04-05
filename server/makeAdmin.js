const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devform';

mongoose.connect(uri)
  .then(async () => {
    const res = await User.updateMany({}, { role: 'admin' });
    console.log('Successfully updated ' + res.modifiedCount + ' users to admin role.');
    console.log('Please log out and log back in to get a new token in your browser.');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
