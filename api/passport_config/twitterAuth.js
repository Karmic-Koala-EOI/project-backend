const passport = require("passport");
const TwitterStrategy = require("passport-twitter").Strategy;
const fs = require('fs');

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
      callbackURL: `http://localhost:3000/auth/twitter/login`
    },
    async (token, tokenSecret, profile, done) => {
      const id = JSON.parse(fs.readFileSync('../id.json')).id;
      const user = await User.findOneAndUpdate({_id:id},{tokenTwitter:token,tokenSecretTwitter:tokenSecret,twitterUserName : profile.username});// si existe en la base de datos
      if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
      
    }
  )
);
  