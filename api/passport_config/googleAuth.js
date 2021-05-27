const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const User = require('../users/users.model');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Estrategia para Registrarse
console.log('afweg3rhy5u7u35y4');
passport.use("sign-in-google",new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log('---------------------------------')
      console.log(profile);
      const user = await User.findById(profile.id);
      console.log(profile);
      if (user) {
        done(null, false);
      } else {
        console.log('Hola');
        let newUser = new User();
            newUser._id = profile.id
            newUser.userName = profile.displayName
            newUser.avatar = profile.photos[0].value,
            newUser.email = profile._json.email,
            newUser.provider = profile.provider
           try{
            await newUser.save() //guardamos en la base de datos
           } catch(err) {
             done('These email just exist',false,'These email just exist');
           }
        done(null, profile); //guardamos en la base de datos
      }
    }
  )
);


// Estrategia para Iniciar Sesion


passport.use("sign-up-google",new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    const user = await User.findById(profile.id);// si existe en la base de datos
                                                 //  puede iniciar sesion
    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
    
  }
)
);