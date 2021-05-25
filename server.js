import express, {json, urlencoded} from "express";
import morgan from "morgan";
import passport from "passport";
import cors from "cors";
import userRouter from './api/users/index'

mongoose.connect('mongodb://localhost/AllIn', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
const PORT = 3000;
const User = require('../users/users.model').default;

//MiddleWares
app.use(passport.initialize());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended:false}))

//Se puede configurar más adelante
app.use(cors())

app.post('/register', (req, res) => {
    let body = req.body;
    let { userName, email, password } = body;
  
    User.create({
      userName,
      avatar,
      password: bcrypt.hashSync(password, 10)
    })
    .then(user => {
      delete user.password;
      return res.status(200).json(user)
    })
    .catch(err => {
        return res.status(400).send('This user just exist');
    });
});

app.post('/login', (req, res) => {
    User.findOne({ userName: req.body.userName })
      .then( usuarioDB => {
        console.log(usuarioDB);
      
        // Verifica que exista un usuario con el mail escrita por el usuario.
           if (!usuarioDB) {
              return res.status(400).json({message: "User/password are incorrect"})
           }
          // Valida que la contraseña escrita por el usuario, sea la almacenada en la db
         if (! bcrypt.compareSync(req.body.password, usuarioDB.password)){
            return res.status(400).send("User/password are incorrect");
         }
  
          // Genera el token de autenticación
          console.log('Todo bien');
          let token = jwt.sign({ usuario: usuarioDB }, process.env.TOKEN_SECRET_KEY)
          res.json({
            usuario: usuarioDB,
            token,
          })
  
      })
      .catch(erro =>  {
         return res.status(500).json( erro )
     })
});

//Router
app.use('/',userRouter);


app.listen(PORT,() => {
    console.log(`Server listen on port ${PORT}`);
})