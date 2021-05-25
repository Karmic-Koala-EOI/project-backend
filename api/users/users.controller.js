const User = require('./users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const getUser = (req,res) => {
    const owner = req.user.usuario.userName;
    const { projected } = req.query;

    if(projected){
        User.findOne({userName:owner})
            .populate('contactsId')
            .select({ contactsId : { $slice : -10}})
            .then(doc => {
                if(typeof doc !== 'null'){
                    user = {
                        userName: doc.userName,
                        email: doc.email
                    }
                    return res.status(200).json(user);
                }
                return res.status(404).send('This user not have contacts');
            })
            .catch(error => res.status(404).send('This user not have contacts'));
    } else {
        User.findOne({userName:owner})
        .then(doc => {
            if(typeof doc !== 'null'){
                user = {
                    userName: doc.userName,
                    email: doc.email
                }

                return res.status(200).json(user);
            }
            return res.status(404).send('This user not exist');
        })
        .catch(error => res.status(404).send(error));
    }
       
}

const deleteUser = (req,res) => {
    const username = req.params.userName;

    User.findOneAndDelete({userName:username})
        .then(user => {
            if(user.contactsId.length !== 0){
                contactController.deleteInContacts(username);
            }

            userDelete = {
                userName: user.userName,
                email: user.email
            }
            return res.status(200).json(userDelete);
        })
        .catch(error => res.status(404).send(error));
}

const patchUser = (req,res) => {
    const userLogged = req.user.usuario.userName;
    const usuario = req.body;

    User.findOneAndUpdate({userName:userLogged},{name: usuario.name, email:usuario.email})
        .then(doc => res.status(202).json(doc))
        .catch(error => {
            if(error === 'The userName just exist'){
                return res.status(400).send(error);
            } else if(error === 'The userName is required'){
                return res.status(404).send(error);
            } else {
                return res.status(404).send(error);
            }
        })
}

const changePassword = (req,res) => {
    const userLogged = req.user.usuario.userName;
    const password = bcrypt.hashSync(req.body.password,10);

    User.updateOne({userName:userLogged},{password: password})
        .then(doc => res.status(202).send('Your password change sucessfully'))
}

const login = (req,res,next) => {
    console.log(req.headers);
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, dataStored) => {
        if (err) return res.status(403).send('The User/Password is not correct');
        req.user = dataStored
        next()
    })
}

const isYou = (req,res,next) => {
    const userLogged = req.user.usuario.userName;
    if(req.params.userName != userLogged){
        return res.status(400).send('You cannot modify/delete another user');
    } else {
        next();
    }
}

module.exports = {
    getUser,
    deleteUser,
    patchUser,
    changePassword,
    login,
    isYou
}