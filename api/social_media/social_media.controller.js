const twitter = require('twitter');
const dotenv = require('dotenv').config();

const koala = new twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret:process.env.API_SECRET_KEY,

    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const postTweet = async (req, res) => {
    const status = req.body.status;

    try{
        const resp = await koala.post('statuses/update',{status: `${status}`});
        return res.status(200).json(resp);

    } catch(err) {
        return res.status(400).send('Post fail');
    }
}

module.exports = {
    postTweet
}
