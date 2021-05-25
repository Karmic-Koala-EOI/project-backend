import passport from "passport";
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

const User = require('../users/users.model').default;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Estrategia para Registrarse

passport.use("sign-in-google",new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:4200/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findById(profile.id);
      
      if (user) {
        done(null, false);
      } else {
        let newUser = new User();
            newUser.nombre = profile.displayName
            newUser.avatar = profile.photos[0].value
           await newUser.save() //guardamos en la base de datos
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
    callbackURL: "http://localhost:4200/auth/google/callback",
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