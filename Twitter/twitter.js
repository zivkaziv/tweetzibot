
const Twit = require('twit');
const config = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
};
let twit = new Twit(config);

module.exports = {
  createAndPost: function (message,tweetToResponseOn) {
    let tweet = {
      status: message
    }
    if(tweetToResponseOn){
      tweet.in_reply_to_status_id = tweetToResponseOn.id_str
    }
    return new Promise(function (resolve, reject) {
      twit.post('statuses/update', tweet, function (err) {
        if (err){
          reject(err)
        }
        resolve();
      })
    });
  },

  searchTweets: function(query,total){
    var queryParam = {
      q:query,
      count:total
    }
     return new Promise(function (resolve, reject) {
      twit.get('search/tweets', queryParam, function (err,data) {
        if (err){
          reject(err);
        }else{
          var tweets = data.statuses;
          // for (var i = 0; i < tweets.length; i++) {
          //   console.log(tweets[i].text + ' by: ' + tweets[i].user.name);
          // }
          resolve(tweets);
        }
      })
     })
  }
}
