const router = require('express').Router()
const passport = require("passport");
const jwt = require("jsonwebtoken");
const userController = require('./users.controller');

//rutas para Google

//ruta para Registrarse

router.get("/auth/google/callback",passport.authenticate("sign-in-google", {scope: ['https://www.googleapis.com/auth/plus.login','email'], session: false }),
  function (req, res) {
    console.log("Registro de Google 1");
    if (req.user) {
      const token = jwt.sign({id: req.user._id}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // equivalente a 24 horas
      })
      res.cookie('session', token);
      console.log("Registro de Google 2");
      console.log(token);
      res.redirect('http://localhost:4200') //rutas por definir

    } else {
      res.redirect('http://localhost:4200/register')
    }
  }
);


//rutas para Iniciar Sesion
router.get(
  "/auth/google/login",
  passport.authenticate("sign-up-google", {scope: ['https://www.googleapis.com/auth/plus.login','email'], session: false }),
  async function (req, res) {
    console.log("Login de Google 1");
    if (req.user) { 
      const token = jwt.sign({usuario: req.user}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // Token que expira a las 24h, pero se puede modificar
      })
      res.cookie('session', token);
      console.log("Login de Google 2");
      console.log(token);
      res.redirect('http://localhost:4200') //rutas por definir

    } else {
  
      res.redirect('http://localhost:3000/login')
    } 
  }
);

router.get('/tweets/trending', userController.getTrendingTopics);
router.post('/postTweet',userController.postTweet);
router.get('/auth/twitter',userController.getUserId,passport.authenticate('sign-up-twitter',{session:false}),() => console.log('hola'));
router.get('/auth/twitter/login', 
  passport.authenticate('sign-up-twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
    //Ruta frontend ---> http://localhost:4200/social-media-accounts
  });
router.get('/', userController.login,userController.getUser);
router.delete('/:email', userController.login,userController.isYou,userController.deleteUser);
router.patch('/:email',userController.login, userController.isYou,userController.patchUser);

module.exports = router;