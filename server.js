const express = require('express');
const morgan = require("morgan");
const passport = require("passport");
const cors = require("cors");
const userRouter = require('./api/users/index');
const socialRouter = require('./api/social_media/index');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const jwt = require('jsonwebtoken');
const googleAuth = require('./api/passport_config/googleAuth');
const twitterAuth = require('./api/passport_config/twitterAuth');

const {MONGO_URL, MONGO_TEST, MONGO_PROD, NODE_ENV} = process.env;

var dB;

if(NODE_ENV === 'test'){
dB = MONGO_TEST;
} else {
dB = NODE_ENV === 'production' 
      ? MONGO_PROD
      : MONGO_URL;
}

console.log(dB);

mongoose.connect(dB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
const PORT = 3000;
const User = require('./api/users/users.model');

//MiddleWares
app.use(passport.initialize());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

//Se puede configurar más adelante
app.use(cors({origin : '*'}))

//Registro clásico por email
app.post('/register', (req, res) => {
    let body = req.body;
    let { userName, email, password } = body;

    if(typeof password === 'undefined' || password === ''){

      return res.status(400).send('The password is empty');

    } else if(!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/)){

      return res.status(400).send('The security of the password is low');
    }
  
    User.create({
      userName,
      email,
      password: bcrypt.hashSync(password, 10),
      _id: new mongoose.Types.ObjectId,
      provider: 'email'
    })
    .then(user => {
      delete user.password;
      return res.status(200).json(user)
    })
    .catch(err => {
      console.log(err);
        return res.status(400).send('This user just exist');
    });
});

//Login clásico por email
app.post('/login', (req, res) => {
    User.findOne({ email: req.body.email })
      .then( usuarioDB => {
        console.log(usuarioDB);
      
        // Verifica que exista un usuario con el mail escrita por el usuario.
           if (!usuarioDB) {
              return res.status(400).json({message: "User/password are incorrect"})
           }
          // Valida que la contraseña escrita por el usuario, sea la almacenada en la db
         if (! bcrypt.compareSync(req.body.password, usuarioDB.password)){
            return res.status(400).send("User/password are incorrect");
         }
  
          // Genera el token de autenticación y lo guardamos
          console.log('Todo bien');
          console.log(process.env.TOKEN_SECRET_KEY);
          let token = jwt.sign({ usuario: usuarioDB }, process.env.TOKEN_SECRET_KEY);

          res.json({
            usuario: usuarioDB,
            token,
          });
  
      })
      .catch(erro =>  {
         return res.status(500).send( erro )
     })
});

//Router
app.use('/',userRouter);
app.use('/',socialRouter);

//Server puesto a la escucha
const server = app.listen(PORT,() => {
    console.log(`Server listen on port ${PORT}`);
});

module.exports = {
  app,
  server
}