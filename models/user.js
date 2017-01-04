const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  twitter_user_id: { type: String ,unique: true },
  twitter_user_name: String,
  last_tweet: Date
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

module.exports = User;
