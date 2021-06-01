const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;

const User = require('../users/users.model');

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use("sign-up-twitter",new TwitterStrategy(
    {
      consumerKey: process.env.API_KEY,
      consumerSecret: process.env.API_SECRET_KEY,
      callbackURL: `http://localhost:3000/auth/twitter/login`,
      passReqToCallback: true
    },
    async (req,token, tokenSecret, profile, done) => {
      //const user = await User.findByIdAndUpdate(req.id,{tokenTwitter:token,tokenSecretTwitter:tokenSecret});// si existe en la base de datos
                                                   //  puede iniciar sesion
        console.log(req.session.user)
        console.log(token);
        console.log(tokenSecret);
    //   if (user) {
    //     done(null, user)
    //   } else {
    //     done(null, false)
    //   }
      
    }
  )
);
  