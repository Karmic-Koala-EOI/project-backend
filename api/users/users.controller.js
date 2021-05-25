import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
const router = Router()

//rutas para Google

//ruta para Registrarse

router.get("/auth/google/callback",passport.authenticate("sign-in-google", {scope: ['https://www.googleapis.com/auth/plus.login'], session: false }),
  function (req, res) {
    if (req.user) {
      const token = jwt.sign({id: req.user._id}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // equivalente a 24 horas
      })
      res.cookie('session', token)        
      res.redirect('http://localhost:3000/') //rutas por definir

    } else {
      res.redirect('http://localhost:3000/register')
    }
  }
);


//rutas para Iniciar Sesion
router.get(
  "/auth/google/login",
  passport.authenticate("sign-up-google", {scope: ['https://www.googleapis.com/auth/plus.login'], session: false }),
  function (req, res) {
    if (req.user) { 
      const token = jwt.sign({id: req.user._id}, process.env.TOKEN_SECRET_KEY, {
        expiresIn: 60 * 60 * 24 // Token que expira a las 24h, pero se puede modificar
      })
      res.cookie('session', token)        
      res.redirect('http://localhost:3000/') //rutas por definir
    } else {
      res.redirect('http://localhost:3000/login')
    } 
  }
);

export default router;