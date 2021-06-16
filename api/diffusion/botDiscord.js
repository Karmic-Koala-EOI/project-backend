const Discord = require('discord.js');
const Twit = require('twit');

const { MessageEmbed } = require('discord.js');

const bot = new Discord.Client();

var tweets1 = []

bot.on("ready", () => {
    console.log("Tu bot (" + bot.user.tag + ") ahora se encuentra en línea!");
    getTweet();
})

bot.on("message", async message => {

    const command = message.content.toLowerCase();

    if (command === "/hola") {
        message.channel.send("**Hola! Tu bot está perfectamente recibiendo mensajes.**");
        return;
    }
})

bot.on("message", async message => {
    
    const command = message.content.toLowerCase();

    if (command === "/tweets") {
        getTweet();

        for (let index = 0; index < 5; index++) {
            message.channel.send(card(tweets1[index].owner,`${tweets1[index].created_at} \n ${tweets1[index].text} \n likes: ${tweets1[index].likes} \n retweets: ${tweets1[index].retweet}`,tweets1[index].img[0]));
        }
        // tweets1.forEach( x => {
        //     message.channel.send(card(x.owner,`${x.created_at} \n ${x.text} \n likes: ${x.likes} \n retweets: ${x.retweet}`,x.img[0]));
        // })
        // return;
    }
    
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

function card(UserName,textTweet,picture) {
    const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(UserName)
        .setImage(picture)
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription(textTweet);
    return embed;
}

bot.login(process.env.TOKEN_DISCORD);