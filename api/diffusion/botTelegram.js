const Telegraf = require('telegraf').Telegraf;
const Twit = require('twit');

const bot = new Telegraf(process.env.TOKEN_TELEGRAM);

var tweets1 = [];

bot.command('start', ctx => {
    console.log(ctx.from)
    bot.telegram.sendMessage(ctx.chat.id, 'hello there! Welcome to my new telegram bot.', {
    
    })
    
})

bot.hears('Tweets', async ctx => {

    await getTweet();
    tweets1.forEach( x => {
        bot.telegram.sendMessage(ctx.chat.id,` --------------- \n ${x.owner} \n creado: ${x.created_at} \n ${x.text} \n ${x.img} \n Likes: ${x.likes} \n Retweets: ${x.retweet} \n ---------------`);
        console.log(x);
    })
})


async function getTweet() {

    const config = {
        consumer_key: process.env.API_KEY,
        consumer_secret: process.env.API_SECRET_KEY,
        access_token:  process.env.ACCESS_TOKEN, 
        access_token_secret: process.env.ACCESS_TOKEN_SECRET,
        timeout_ms: 60 * 1000,  
        strictSSL:true
    }

    // const user = getUser()
    // if(user){
    //     console.log(user);
    // }
    
    const twits = new Twit(config);

    const userName = 'KarmicKoala1';

    const call = await twits.get('statuses/user_timeline', userName);
    const tweets = call.data;

    const tweetsFiltered = tweets.map( tweet => {

        let media = tweet.entities.media;

        let tw = {
            owner : "",
            created_at : "",
            text : "",
            img : "",
            likes : 0,
            retweet: 0
        }
        tw.owner = tweet.user.name;
        tw.created_at = tweet.created_at;
        tw.text = tweet.text;
        tw.likes = tweet.favorite_count;
        tw.retweet = tweet.retweet_count;

        if(media !== undefined) {
            tw.img = media.map( x => x.media_url);
        }

        return tw;
    });

    tweets1 = tweetsFiltered;
}

bot.launch();