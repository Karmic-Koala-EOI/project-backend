const JWTstrategy = require('passport-jwt').Strategy;
const passport = require('passport')

const ExtractJWT = require('passport-jwt').ExtractJwt;

//Verificamos que el token sea el correcto
passport.use(new JWTstrategy({
  //Ponemos nuestra SecretKey
  secretOrKey : process.env.TOKEN_SECRET_KEY,
  //esperamos que el usuario envíe el token como un parámetro de consulta con el nombre 'secret_token'
  jwtFromRequest : ExtractJWT.fromUrlQueryParameter('secret_token')
}, (token, done) => {
  try {
    //Pass the user details to the next middleware
    return done(null, token);
  } catch (error) {
    done(error);
  }
}))