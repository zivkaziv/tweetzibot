'use strict'

const twitMessager = require('./Twitter/twitter')

let interval

try {
  interval = setInterval(checkTwittsToRespod, 2000)
} catch (e) {
  clearInterval(interval)
}

function checkTwittsToRespod () {
  twitMessager.searchTweets('כביש החוף',10);
    // twitMessager.createAndPost('This is my first twit bot')
}
