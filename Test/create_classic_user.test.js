const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server} = require('../server');
const User = require('../api/users/users.model');

const api = supertest(app);

//Borramos La base de Datos para evitar el side effect de los tests
beforeEach(async () => {
    await User.deleteMany({});
})

test('Create Classic User', async () => {
    const user = {
        userName: 'Pepe',
        email: 'pepe@gmail.com',
        password: '#Pepe21#', 
    }

    await api
            .post('/register')
            .send(user)
            .expect(200)
            .expect('Content-Type', /application\/json/);
});

test('Create Classic user without email', async () => {
    const user = {
        userName: 'Pepe',
        password: '#Pepe21#', 
    }

    await api
            .post('/register')
            .send(user)
            .expect(400)
            .expect('Content-Type', /text\/html/);
});

test('Create Classic user with the same email', async () => {
    const user = {
        userName: 'Pepe',
        email: 'pepe@gmail.com',
        password: '#Pepe21#', 
        _id: new mongoose.Types.ObjectId
    }

    const userM = new User(user)
    await userM.save();

    const user2 = {
        userName: 'Paco',
        email: 'pepe@gmail.com',
        password: '#Pepe21#', 
    }

    await api
            .post('/register')
            .send(user2)
            .expect(400)
            .expect('Content-Type', /text\/html/);
});

test('Create user without password', async () => {
    const user = {
        userName: 'Pepe',
        email: 'pepe@gmail.com', 
    }

    await api
            .post('/register')
            .send(user)
            .expect(400)
            .expect('Content-Type', /text\/html/);
})


//Cerramos Mongo y Server
afterAll( () => {
    server.close();
    mongoose.disconnect();
})