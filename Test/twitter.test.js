const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server} = require('../server');
const User = require('../api/users/users.model'); 
const dotenv = require('dotenv').config();
const bcrypt = require('bcrypt');

const api = supertest(app);

//Borramos La base de Datos para evitar el side effect de los tests
beforeEach(async () => {
    await User.deleteMany({});
    const user = {
        userName: 'Pepe',
        email: 'pepe@gmail.com',
        password: bcrypt.hashSync('#Pepe21#', 10), 
        _id: new mongoose.Types.ObjectId,
        tokenSecretTwitter: process.env.ACCESS_TOKEN_SECRET,
        tokenTwitter: process.env.ACCESS_TOKEN,
        twitterUserName: 'KarmicKoala1'
    }

    const userM = new User(user)
    await userM.save();
});

test('Get Tweets Stats', async () => {

    await api
            .get('/tweets/KarmicKoala1')
            .expect(200)
            .expect('Content-Type', /application\/json/);
});

test('Bad Request to Trending Tweets', async () => {

    await api
            .get('/tweets/trending/')
            .expect(400)
});

test('Get Trending Tweets', async () => {

    await api
            .get('/tweets/trending/Global')
            .expect(200)
            .expect('Content-Type', /application\/json/);
});

test('POST tweet with only message', async () => {
    const user = await User.findOne({email:"pepe@gmail.com"});
    const body = {
        data: {
            message: "TEST"
        },
        query: {
            _id: user._id
        }
    }

    await api
            .post('/postTweet')
            .send(body)
            .expect(200)
            .expect('Content-Type', /text\/html/);
});


//Cerramos Mongo y Server
afterAll( () => {
    server.close();
    mongoose.disconnect();
});