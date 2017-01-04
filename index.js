'use strict'
const mongoose = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');

const twitMessager = require('./Twitter/twitter')
const Setting = require('./models/Setting');
const User = require('./models/User');

dotenv.load({ path: '.env.example' });
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

try {
  let interval  
  interval = setInterval(checkTwittsToRespod, 2000)
} catch (e) {
  clearInterval(interval)
}

function checkTwittsToRespod () {
  Setting.findOne({ 'is_service_enable':'true' }, (err, setting) => {
     if (err) { return done(err); }
     if(setting){
       //Get tweets
       twitMessager.searchTweets('כביש החוף',10).then(function(tweets){
         //for every tweet
         tweets = tweets.filter((tweet, index, self) => self.findIndex((t) => {return t.user.id === tweet.user.id; }) === index)
         for (var tweetIndex = 0; tweetIndex < tweets.length; tweetIndex++) {
            handleSingleTweet(tweets[tweetIndex]);
         }
       })
     }
  });
  
}

function handleSingleTweet(tweet){
  //Try to find the user in the DB  
  User.findOne({twitter_user_id:tweet.user.id_str},function(err,user){
    if (err) { return done(err); }
    let validDate = new Date();
    validDate.setDate(validDate.getDate()-1);
    //Check if the user not exist || we didn't respond on his tweet for the last 24 hours
    if(!user || new Date(user.last_tweet) < validDate) {
        replayTweetToUser(tweet,user);
    }
  })
}

function replayTweetToUser(tweet,user){
  let tweetText = '';
  if(tweet.text.indexOf('כביש החוף')){
    tweetText = 'Hey @' + tweet.user.screen_name + ' check this clip https://www.youtube.com/watch?v=2ytxv_m7KL0 ye ye ye';
  }
  console.log('tweeting ' + tweetText);
  // twitMessager.createAndPost(tweetText,tweet);
  if(!user){
    user = new User();
    user.twitter_user_id = tweet.user.id;
    user.twitter_user_name = tweet.user.screen_name;
  }
  user.last_tweet = new Date();
  user.update(user,{upsert: true},function(err,user){
    if (!err){
      console.log(user + ' saved');
    }
  })
}
