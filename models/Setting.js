const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String ,unique: true },
  value: String,
  created_time: Date
}, { timestamps: true });


const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
