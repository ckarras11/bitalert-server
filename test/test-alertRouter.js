const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { Alert } = require('../models/alert');

const should = chai.should();
chai.use(chaiHttp);

function generateData() {
    return {
        phoneNumber: faker.phone.phoneNumberFormat(),
        alert: {
            price: faker.random.number(),
            removeFlag: faker.random.boolean(),
            created: faker.date.recent(),
        },
    };
}

function seedData() {
    console.info('Seeding Data');
    const seedData = [];
    for (let i = 0; i <= 10; i++) {
        seedData.push(generateData());
    }
    return Alert.insertMany(seedData);
}

function tearDown() {
    console.warn('Deleting DB');
    return mongoose.connection.dropDatabase();
}

describe('Testing /api/alerts', function () {
    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedData();
    });

    afterEach(function () {
        return tearDown();
    });

    after(function () {
        return closeServer();
    });

    describe('GET /api/alerts/:phoneNumber', function () {
        it('should retrieve all the alerts from the db for a particular number', function () {
            let resAlert;
            return Alert
                .findOne()
                .then(function (res) {
                    resAlert = res;
                    return chai.request(app).get(`/api/alerts/${resAlert.phoneNumber}`);
                })
                .then(function (res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body.forEach(function (alert) {
                        alert.should.be.a('object');
                        alert.should.include.keys('phoneNumber', 'alert');
                        alert.alert.should.be.a('object');
                        alert.alert.should.include.keys('price', 'created', 'removeFlag');
                    });
                });
        });
    });

    describe('POST /api/alerts', function () {
        it('should create a new alert', function () {
            const newAlert = generateData();
            return chai.request(app)
            .post('/api/alerts')
            .send(newAlert)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('phoneNumber', 'alert');
                res.body.alert.should.include.keys('price', 'removeFlag', 'created');
                res.body.id.should.not.be.null;
                return Alert.findById(res.body.id);
            })
            .then(function (alert) {
                alert.phoneNumber.should.equal(newAlert.phoneNumber);
            });
        });
    });

    describe('DELETE /api/alerts', function () {
        it('should remove an alert form the db', function () {
            let resAlert;
            return Alert
                .findOne()
                .then(function (_alert) {
                    resAlert = _alert;
                    return chai.request(app).delete(`/api/alerts/${resAlert.id}`);
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Alert.findById(resAlert.id);
                })
                .then(function (_alert) {
                    should.not.exist(_alert);
                });
        });
    });
});

