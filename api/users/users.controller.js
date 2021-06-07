const User = require('./users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Twit = require('twit');
const woeid = require('twitter-woeid');

//Función que devuelve un usuario ya logeado
const getUser = (req,res) => {
    const owner = req.user.usuario.email;
    // const { projected } = req.query;

    // if(projected){
    //     User.findOne({userName:owner})
    //         .populate('contactsId')
    //         .select({ contactsId : { $slice : -10}})
    //         .then(doc => {
    //             if(typeof doc !== 'null'){
    //                 user = {
    //                     userName: doc.userName,
    //                     email: doc.email
    //                 }
    //                 return res.status(200).json(user);
    //             }
    //             return res.status(404).send('This user not have contacts');
    //         })
    //         .catch(error => res.status(404).send('This user not have contacts'));
    // } else {
    User.findOne({email:owner})
    .then(doc => {
        if(typeof doc !== 'null'){
            let twitterLogged = (doc.tokenTwitter && doc.tokenSecretTwitter)  ? true : false;
            user = {
                id: doc._id,
                userName: doc.userName,
                email: doc.email,
                twitterLogged: twitterLogged,
                company: doc.company,
                country: doc.country
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
    const company = usuario.company || '';
    const country = usuario.country || '';

    User.findOneAndUpdate({email:userLoggedEmail},{userName: usuario.userName, avatar:avatar, company:company, country:country})
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
    const id = req.body.query.id;

    try {
        const user = await User.findOne({_id:id});

        //Comprobación de datos necesarios para el tweet
        if(typeof user.tokenSecretTwitter === 'undefined' || typeof user.tokenTwitter === 'undefined'){
            return res.status(400).send('This user not have a twitter account linked')

        } else if( message === '' || typeof message === 'undefined'){
            return res.status(400).send('The message is empty');
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

        if((typeof photo_url !== 'undefined') && (photo_url !== '')){
            
                //Codificamos la imagen en 64
                const b64content = fs.readFileSync('koala_crazy.jpeg', { encoding: 'base64' })
    
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
                                return res;
                            })
                        }
                    })
                    return response;
                })
                return res.status(200).send('Post tweet with image');
           
        }

       //Post de un tweet con texto plano
        T.post('statuses/update', { status: message }, function(err, data, res) {
            if (err){
                console.log("oops, didn't tweet: ", err.message)
            }
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
    const country = req.body.country;
    var country_code = 1

    if(typeof country !== 'undefined'){
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

        console.log('Llega por aki');

        const resp = await T.get('trends/place',{id: country_code});
        const trends = resp.data[0];
        return res.status(200).json(trends);

    } catch(err){
        return res.status(400).send(err);
    }

}

//Función que guarda el id del usuario con fs recibido por query
const getUserId = (req,res,next) => {
    console.log("query" + req.query);

    fs.writeFileSync('/tmp/id.json',JSON.stringify({id:req.query.id}));
    const id = JSON.parse(fs.readFileSync('/tmp/id.json')).id;
    console.log('id ' + id )
    next()
}

//Middleware que comprueba si el usuario está logeado
const login = (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, dataStored) => {
        if (err) return res.status(403).send('The User/Password is not correct');
        req.user = dataStored;
        next()
    })
}

/**Middleware que comprueba que eres tu para realizar acciones solo 
 * puedes realiazar en tu propia cuenta
 **/
const isYou = (req,res,next) => {
    const userLogged = req.user.usuario.email;

    if(req.params.email != userLogged){
        return res.status(400).send('You cannot modify/delete another user');
    } else {
        next();
    }
}

module.exports = {
    getUser,
    deleteUser,
    patchUser,
    changePassword,
    login,
    isYou,
    getUserId,
    postTweet, 
    getTrendingTopics
}