const Telegraf = require('telegraf').Telegraf;
const Twit = require('twit');

const bot = new Telegraf(process.env.TOKEN_TELEGRAM);

var tweets1 = ['tweets: ']

bot.on(() => {
    //getTweet()
})

bot.command('start', ctx => {
    console.log(ctx.from)
    //getTweet()
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
    
    })
    
})

bot.hears('Tweets', async ctx => {

    await getTweet();
    tweets1.forEach( x => {
        bot.telegram.sendMessage(ctx.chat.id,`${x}`);
        console.log(x);
    })
})


async function getTweet() {

    const config = {
        consumer_key: process.env.API_KEY,
        consumer_secret: process.env.API_SECRET_KEY,
        access_token:  user.tokenTwitter, 
        access_token_secret: user.tokenSecretTwitter,
        timeout_ms: 60 * 1000,  
        strictSSL:true
    }

    const twits = new Twit(config);

    const userName = 'KarmicKoala1';

    const call = await twits.get('statuses/user_timeline', userName);
    const tweets = call.data;

    tweets.map( tweet => {
        tweets1.push(tweet.text)
    });

    console.log(tweets1);
    return tweets1;
}

bot.launch();