const User = require('./users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Twit = require('twit');
const woeid = require('twitter-woeid');

//Función que devuelve un usuario ya logeado
const getUser = (req,res) => {
    const owner = req.user.usuario.email;
    User.findOne({email:owner})
    .then(doc => {
        if(typeof doc !== 'null'){
            let twitterLogged = (doc.tokenTwitter && doc.tokenSecretTwitter)  ? true : false;
            user = {
                _id: doc._id,
                userName: doc.userName,
                email: doc.email,
                twitterLogged: twitterLogged,
                company: doc.company,
                country: doc.country,
                twitterUserName: doc.twitterUserName
            }
            return res.status(200).json(user);
        }
        return res.status(404).send('This user not exist');
    })
    .catch(error => res.status(404).send(error));
    //
       
}

//Función que borra la cuenta de un usuario ya logeado
const deleteUser = (req,res) => {
    const email = req.params.email;

    User.findOneAndDelete({email:email})
        .then(user => {

            userDelete = {
                userName: user.userName,
                email: user.email
            }
            return res.status(200).json(userDelete);
        })
        .catch(error => res.status(404).send(error));
}

/**Función que modifica la cuenta de un usuario ya logeado,
 * le puede cambiar el userName,email, avatar y company
 **/
 const patchUser = (req,res) => {
    const userLoggedEmail = req.user.usuario.email;
    const usuario = req.body; 
    const avatar = usuario.avatar || req.user.usuario.avatar || '';
    const company = usuario.company || req.user.usuario.company || '';
    const country = usuario.country || req.user.usuario.country || '';
    const tokenTwitter = usuario.tokenTwitter || req.user.usuario.tokenTwitter || '';
    const tokenSecretTwitter = usuario.tokenSecretTwitter || req.user.usuario.tokenSecretTwitter || '';

    User.findOneAndUpdate({email:userLoggedEmail},{userName: usuario.userName, avatar:avatar, company:company, country:country, tokenTwitter:tokenTwitter, tokenSecretTwitter:tokenSecretTwitter})
        .then(doc => {
            if(doc !== null){
                return res.status(202).json(doc);
            }

            return res.status(404).send('The user not exist');
        })
        .catch(error => {
            if(error === 'The email just exist'){
                return res.status(400).send(error);
            } else if(error === 'The email is required'){
                return res.status(404).send(error);
            } else {
                return res.status(404).send(error);
            }
        })
}

//Función que permite a un usuario logeado cambiar de contraseña
const changePassword = (req,res) => {
    const userLogged = req.user.usuario.userName;

    if(!req.body.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/)){
        return res.status(400).send('The security of the password is low');

    }
    const password = bcrypt.hashSync(req.body.password,10);

    User.updateOne({userName:userLogged},{password: password})
        .then(doc => res.status(202).send('Your password change sucessfully'))
}

/**Función que permite postear un tweet con texto plano o contenido multimedia.
 * A traves del token y el tokenSecret de su cuenta mandamos el mensaje. La petición
 * debe incluir el id como query y por el body debe llegar un mensaje, o un mensaje
 * con foto.
**/
const postTweet = async (req,res) => {
    const {message, photo_url } = req.body.data;
    const id = req.body.query._id;

    try {
        const user = await User.findOne({_id:id});

        //Comprobación de datos necesarios para el tweet
        if(typeof user.tokenSecretTwitter === 'undefined' || typeof user.tokenTwitter === 'undefined'){
            return res.status(400).send('This user not have a twitter account linked')

        } else if((message === '' || typeof message === undefined) && (photo_url === '' || typeof photo_url === undefined)){
            return res.status(400).send('Message and photo is empty');
        }

        const { tokenTwitter, tokenSecretTwitter} = user;

        //Parámetros de configuración de Twit
        const config = {
            consumer_key: process.env.API_KEY,
            consumer_secret:process.env.API_SECRET_KEY,
            access_token: tokenTwitter, 
            access_token_secret: tokenSecretTwitter,
            timeout_ms: 60 * 1000,  
            strictSSL:true
        }

        const T = new Twit(config);

        if((photo_url !== undefined) && (photo_url !== '')){
            
                //Codificamos la imagen en 64
                const b64content = photo_url;
    
                // Cargamos el fichero de video/imagen
                T.post('media/upload', { media_data: b64content }, function (err, data, response) {
                    const mediaIdStr = data.media_id_string
                    const altText = "Koala wins"
                    const meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
                
                    T.post('media/metadata/create', meta_params, function (err, data, response) {
                        if (!err) {
                            // Una vez cargado el contenido multimedia ya podemos hacerle referencia
                            const params = { status: message, media_ids: [mediaIdStr] }
                
                            T.post('statuses/update', params, function (err, data, response) {
                                if (err){
                                    console.log("oops, didn't tweet: ", err.message)
                                }
                                console.log(res);
                                return res;
                                
                            })
                        }
                    })
                    console.log(response);
                    return response;
                })
                return res.status(200).send('Post tweet with image');
           
        }

       //Post de un tweet con texto plano
        T.post('statuses/update', { status: message }, function(err, data, res) {
            if (err){
                console.log("oops, didn't tweet: ", err.message)
            }
            console.log(res);
            return res;
        });

        return res.status(200).send('Send tweet');

    } catch(err){

        return res.status(400).send(err)
    }
}

/**Te devuelve los 50 trending topics del país que le
 * pasas por body
**/
const getTrendingTopics = async (req,res) => {
    const country = req.params.country;
    var country_code = 1

    if((country !== "undefined") && (country !== "Global")){
        country_code = woeid.getSingleWOEID(country.toLowerCase())[0].woeid
    }

    try{
        //Parámetros de configuración de Twit
        const config = {
            consumer_key: process.env.API_KEY,
            consumer_secret:process.env.API_SECRET_KEY,
            access_token: process.env.ACCESS_TOKEN, 
            access_token_secret: process.env.ACCESS_TOKEN_SECRET,
            timeout_ms: 60 * 1000,  
            strictSSL:true
        }

        const T = new Twit(config);

        const resp = await T.get('trends/place',{id: country_code});
        const trends = resp.data[0];
        return res.status(200).json(trends);

    } catch(err){
        return res.status(400).send(err);
    }

}
/**
 * Función que te devuelve los tweets con sus estadistícas,
 * retweets, likes, etc
 **/
const getTweetsWithStats = async (req,res) => {

    try{
        const user = await User.findOne({twitterUserName: req.params.twitterUserName});
        if(!user){
            return res.status(400).send("This twitter account not exist in database");
        }

        const config = {
            consumer_key: process.env.API_KEY,
            consumer_secret:process.env.API_SECRET_KEY,
            access_token: user.tokenTwitter, 
            access_token_secret: user.tokenSecretTwitter,
            timeout_ms: 60 * 1000,  
            strictSSL:true
        }

        const T = new Twit(config);
        const resp =  await T.get('statuses/user_timeline', { screen_name: user.twitterUserName });
        const tweets = resp.data;

        //Si quieres añadirle mas datos es solo poner esos en la respuesta de Twitter
        // id: 1400427396772339700,
        // id_str: '1400427396772339714',

        const tweetsFormated = tweets.map( tweet => {
            let tw = {
                created_at : "",
                retweet_count: 0,
                favorite_count: 0
            }

            if(tweet.text.includes('https') && tweet.text.indexOf('https') !== 0){
                tw.twitter_link = tweet.text.substring(tweet.text.indexOf('https'),tweet.text.length);
                tw.text = tweet.text.substring(0,tweet.text.indexOf('https'));
            } else if(tweet.text.indexOf('https') === 0) {
                tw.twitter_link = tweet.text.substring(0,tweet.text.length);
            } else {
                tw.text = tweet.text;
            }

            tw.created_at = tweet.created_at;
            tw.retweet_count = tweet.retweet_count;
            tw.favorite_count = tweet.favorite_count;
            return tw;
        });

        return res.status(200).json(tweetsFormated);

    } catch (err) {
        return res.status(404).send("Some error appear :)");
    }
}

module.exports = {
    getUser,
    deleteUser,
    patchUser,
    changePassword,
    postTweet, 
    getTrendingTopics,
    getTweetsWithStats
}