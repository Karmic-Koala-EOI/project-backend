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


var params = {screen_name: 'KarmicKoala1'};

const getTweet = () => {
    koala.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (!error) {
        console.log(tweets);
        } else {
        console.log(error);
        }
    });
}





// var twitterV2 = require("twitter-v2")

// const client = new twitterV2({
//   consumer_key: '',
//   consumer_secret: '',
//   access_token_key: '',
//   access_token_secret: ''
// });

// async function  getTwit()  {
//     const { data } = await client.get('tweets', { ids: '1228393702244134912' });
//     console.log(data);
// }

// getTwit()


