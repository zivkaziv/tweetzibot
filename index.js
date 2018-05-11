'use strict'

const mongoose = require('mongoose');
const chalk = require('chalk');
const dotenv = require('dotenv');

const twitMessager = require('./Twitter/twitter')
const Setting = require('./models/Setting');
const User = require('./models/user');

dotenv.load({ path: '.env.example' });
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

try {
  let interval
  interval = setInterval(checkTwittsToRespod, 120000)
} catch (e) {
  clearInterval(interval)
}

function checkTwittsToRespod () {
  Setting.findOne({ key:'is_service_enable'}, (err, setting) => {
     if (err) { return done(err); }
     if(setting && setting.value == 'true'){
       console.log('Start running.', chalk.red('✗'));
       //Get tweets
       // twitMessager.searchTweets('כביש החוף',10).then(function(tweets){
       twitMessager.searchTweets('בריכה',10).then(function(tweets){
         //for every tweet
         tweets = tweets.filter((tweet, index, self) => self.findIndex((t) => {return t.user.id === tweet.user.id; }) === index)
         console.log('Found ' + tweets.length + ' tweets');
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
    if( !user || new Date(user.last_tweet) < validDate) {
      //answer only on tweets from the last hour
      let validTweetTime = new Date();
      validTweetTime.setHours(validTweetTime.getHours() - 3);
      if(new Date(tweet.created_at) > validTweetTime){
        replayTweetToUser(tweet,user);
      }else{
        console.log('Really old tweet of ' + tweet.user.screen_name);
      }
    }else{
      console.log('We are not going to send tweet to ' + tweet.user.screen_name);
    }
  })
}

function replayTweetToUser(tweet,user){
  let tweetText = '';
  tweetText = 'הי @' + tweet.user.screen_name + ' איזה שמש... https://www.youtube.com/watch?v=ogxRmmUeM0o ';
  // tweetText += 'יה יה יה...';
  tweetText += 'איך היא אוהבת את השמש..';

  twitMessager.createAndPost(tweetText,tweet).then(function(){
   console.log('tweeting ' + tweetText);
  },function(err){
    console.log('Failed to replay tweet, Mark this user anyway...');
  });

   if(!user){
      user = new User();
      user.twitter_user_id = tweet.user.id_str;
      user.twitter_user_name = tweet.user.screen_name;
    }
    user.last_tweet = new Date();
    user.update(user,{upsert: true},function(err,user){
      if (!err){
        console.log(user + ' saved');
      }
   });
}

