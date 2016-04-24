const Twitter = require('twitter');
const env = require('node-env-file');

// Load in environment variables
env(`${__dirname}/../config/config.env`);

// Twitter setup
module.exports = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});
