
const Twit = require('twit')
let twit = new Twit(require('./config.js'));
module.exports = {
  createAndPost: function (message) {
    let tweet = {
      status: message
    }
    twit.post('statuses/update', tweet, function (err) {
      if (err) return console.log('error', err)
      console.log('Twgit posted /,,/,')
    })
  },
  searchTweets: function(query,total){
    var queryParam = {
      q:query,
      count:total
    }
    twit.get('search/tweets', queryParam, function (err,data) {
      if (err){
        return console.log('error', err)
      }else{
        var tweets = data.statuses;
        for (var i = 0; i < tweets.length; i++) {
          console.log(tweets[i].text + ' by: ' + tweets[i].user.name);
        }
      }
    })
  }
}
