const jwt = require('jsonwebtoken');
const fs = require('fs');

//Función que guarda el id del usuario con fs recibido por query
const getUserId = (req,res,next) => {

    fs.writeFileSync('../id.json',JSON.stringify({id:req.query.id}));
    const id = JSON.parse(fs.readFileSync('../id.json')).id;
    next()
}

//Middleware que comprueba si el usuario está logeado
const login = (req,res,next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, dataStored) => {
        if (err) return res.status(403).send('The User/Password is not correct');
        req.user = dataStored;
        next()
    })
}

/**Middleware que comprueba que eres tu para realizar acciones solo 
 * puedes realiazar en tu propia cuenta
 **/
const isYou = (req,res,next) => {
    const userLogged = req.user.usuario.email;

    if(req.params.email != userLogged){
        return res.status(400).send('You cannot modify/delete another user');
    } else {
        next();
    }
}

module.exports = {
    getUserId,
    login,
    isYou
}