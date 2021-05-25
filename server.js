import express, {json, urlencoded} from "express";
import morgan from "morgan";
import passport from "passport";
import cors from "cors";
import router from './api/users/users.controller'

mongoose.connect('mongodb://localhost/AllIn');

const app = express();
const PORT = 3000;

//MiddleWares
app.use(express.json());


app.listen(PORT,() => {
    console.log(`Server listen on port ${PORT}`);
})