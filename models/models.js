const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Please enter a valid email address'] },
  password: { type: String, required: true, minlength: 6 },
  name: { type: String, required: true }
}, { timestamps: true });


const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  ticketsSold: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Event = mongoose.model('Event', eventSchema);

module.exports = { User, Event };
