const router = require('express').Router()
const passport = require("passport");
const jwt = require("jsonwebtoken");
const userController = require('./users.controller');
const userMiddlewares = require('../middlewares/user.middlewares');
const { serialize } = require('cookie');

//rutas para Google

//ruta para Registrarse

router.get("/auth/google/callback",passport.authenticate("sign-in-google", {scope: ['https://www.googleapis.com/auth/plus.login','email'], session: false }),
  function (req, res) {
    if (req.user) {
      const token = jwt.sign({usuario: req.user}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // equivalente a 24 horas
      })
      res.cookie('session', token);
      const cookie = serialize('session', token, {httpOnly: true})
      res.setHeader('Set-Cookie',[cookie])
      console.log("Registro de Google 2");
      console.log(req.user._id);
      res.redirect(`https://karmickoala.vercel.app?google=${token}&id=${req.user._id}`) //rutas por definir
    } else {
      res.redirect('https://karmickoala.vercel.app/register')
    }
  }
);


//rutas para Iniciar Sesion
router.get(
  "/auth/google/login",
  passport.authenticate("sign-up-google", {scope: ['https://www.googleapis.com/auth/plus.login','email'], session: false }),
  async function (req, res) {
    if (req.user) { 
      const token = jwt.sign({usuario: req.user}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // Token que expira a las 24h, pero se puede modificar
      })
      res.cookie('session', token);
      const cookie = serialize('session', token, {httpOnly: true})
      res.setHeader('Set-Cookie',[cookie])
      console.log("Login de Google 2");
      console.log(token);
      res.redirect(`https://karmickoala.vercel.app?google=${token}&id=${req.user._id}`) //rutas por definir

    } else {
  
      res.redirect('https://karmickoala.vercel.app/login')
    } 
  }
);

router.get('/tweets/:twitterUserName', userController.getTweetsWithStats);
router.get('/tweets/trending/:country', userController.getTrendingTopics);
router.post('/postTweet',userController.postTweet);
router.get('/auth/twitter',userMiddlewares.getUserId,passport.authenticate('sign-up-twitter',{session:false}));
router.get('/auth/twitter/login', 
  passport.authenticate('sign-up-twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('https://karmickoala.vercel.app/dashboard/profile');
    //Ruta frontend ---> http://localhost:4200/dashboard/social-media-accounts
  });
router.get('/', userMiddlewares.login,userController.getUser);
router.delete('/:email', userMiddlewares.login,userMiddlewares.isYou,userController.deleteUser);
router.patch('/:email',userMiddlewares.login, userMiddlewares.isYou,userController.patchUser);

module.exports = router;