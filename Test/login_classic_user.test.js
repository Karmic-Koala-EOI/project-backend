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
})

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

//Cerramos Mongo y Server
afterAll( () => {
    server.close();
    mongoose.disconnect();
})