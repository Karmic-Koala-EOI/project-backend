const twitter = require('twitter');
const dotenv = require('dotenv').config();

const koala = new twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret:process.env.API_SECRET_KEY,

    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

module.exports = {
    postTweet
}
