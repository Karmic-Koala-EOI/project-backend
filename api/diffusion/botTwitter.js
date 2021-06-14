const disc = require('discord.js');
const Twit = require('twit');

const { MessageEmbed } = require('discord.js');

const bot = new disc.Client();

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
        tweets1.forEach( x => {
            message.channel.send(`${x.created_at} \n ${x.text}`);
            //
        })
        return;
    }
    
})

async function getTweet() {

    const config = {
        consumer_key: 'XQWsX0Q71ia0jnF5CnLiLB7rC',
        consumer_secret: 'VijoBdIy6gL8hkYAIO59lfZa71QiECPCjBl55d8WuJKDSAC3tR',
        access_token: '1399639642186686466-IluKnq8pxgkh9LZuaVAbDWtTLrMpgR', 
        access_token_secret: 'ZxFAxVtpysi83kdgjDfj9C9GXOjQsm30559MuPr1tu7oZ',
        timeout_ms: 60 * 1000,  
        strictSSL:true
    }

    const twits = new Twit(config);

    const userName = 'KarmicKoala1';

    const call = await twits.get('statuses/user_timeline', userName);
    const tweets = call.data;

    const tweetsFiltered = tweets.map( tweet => {
        let tw = {
            created_at : "",
            text : ""
        }
        tw.created_at = tweet.created_at;
        tw.text = tweet.text;

        return tw;
    });

    tweets1 = tweetsFiltered;
}

function card(UserName,textTweet) {
    const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(UserName)
        //.setImage(picture)
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription(textTweet);
    return embed;

}


bot.login("ODUxODUwMjI4OTM5NzUxNDU0.YL-RWQ.VsvGcGTQkV53Qg-fUuDMp4t-P-8");