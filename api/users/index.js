const router = require('express').Router()
const passport = require("passport");
const jwt = require("jsonwebtoken");
const userController = require('./users.controller');
const User = require('./users.model');
const { request } = require('express');
const Twit = require('twit');

//rutas para Google

//ruta para Registrarse

router.get("/auth/google/callback",passport.authenticate("sign-in-google", {scope: ['https://www.googleapis.com/auth/plus.login','email'], session: false }),
  function (req, res) {
    if (req.user) {
      const token = jwt.sign({id: req.user._id}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // equivalente a 24 horas
      })
      res.cookie('session', token)        
      res.redirect('http://localhost:3000') //rutas por definir

    } else {
      res.redirect('http://localhost:3000/register')
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
      res.redirect('http://localhost:3000/') //rutas por definir

    } else {
  
      res.redirect('http://localhost:3000/login')
    } 
  }
);

router.post('/postTweet',userController.postTweet);
router.get('/auth/twitter',userController.getUserId,passport.authenticate('sign-up-twitter',{session:false}),() => console.log('hola'));
router.get('/auth/twitter/login', 
  passport.authenticate('sign-up-twitter', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
router.get('/', userController.login,userController.getUser);
router.delete('/:userName', userController.login,userController.isYou,userController.deleteUser);
router.patch('/:userName',userController.login, userController.isYou,userController.patchUser);

module.exports = router;