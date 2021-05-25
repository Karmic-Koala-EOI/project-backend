import express, {json, urlencoded} from "express";
import morgan from "morgan";
import passport from "passport";
import cors from "cors";
import router from './api/users/users.controller'

mongoose.connect('mongodb://localhost/AllIn', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
const PORT = 3000;

//MiddleWares
app.use(passport.initialize());
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended:false}))

//Se puede configurar más adelante
app.use(cors())


app.listen(PORT,() => {
    console.log(`Server listen on port ${PORT}`);
})