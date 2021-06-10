const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server} = require('../server');
const User = require('../api/users/users.model'); 
const bcrypt = require('bcrypt');

const api = supertest(app);

//Borramos La base de Datos para evitar el side effect de los tests
beforeEach(async () => {
    await User.deleteMany({});
    const user = {
        userName: 'Pepe',
        email: 'pepe@gmail.com',
        password: bcrypt.hashSync('#Pepe21#', 10), 
        _id: new mongoose.Types.ObjectId
    }

    const userM = new User(user)
    await userM.save();
});

test('Login Classic User', async () => {
    const userLogin = {
        email: 'pepe@gmail.com',
        password: '#Pepe21#'
    }

    await api
            .post('/login')
            .send(userLogin)
            .expect(200)
            .expect('Content-Type', /application\/json/);
});

test('Login Classic User with incorrect password', async () => {
    const userLogin = {
        email: 'pepe@gmail.com',
        password: '#Pepe2#'
    }

    await api
            .post('/login')
            .send(userLogin)
            .expect(400)
            .expect('Content-Type', /text\/html/);
});

test('Login Classic User with an email that not exist', async () => {
    const userLogin = {
        email: 'pepegmail.com',
        password: '#Pepe21#'
    }

    await api
            .post('/login')
            .send(userLogin)
            .expect(400)
            .expect('Content-Type', /text\/html/);
});

test('Login Classic User with an email that not exist', async () => {
    const userLogin = {
        email: 'pepegmail.com',
        password: '#Pepe21#'
    }

    await api
            .post('/login')
            .send(userLogin)
            .expect(400)
            .expect('Content-Type', /text\/html/);
});


//Cerramos Mongo y Server
afterAll( () => {
    server.close();
    mongoose.disconnect();
});