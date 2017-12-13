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

describe('Testing api/alerts', function () {
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

    describe('GET api/alerts', function () {
        it('should retrieve all the alerts from the db', function () {
            let res;
            return chai.request(app)
                .get('/api/alerts')
                .then(function (_res) {
                    res = _res;
                    res.should.have.status(200);
                    return Alert.count();
                })
                .then(function (count) {
                    res.body.length.should.equal(count);
                });
        });
        /* it('should retrieve vehicles with the correct keys', function () {
            let resPrice;
            return chai.request(app)
                .get('/api/price')
                .then(function (res) {
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.a('array');
                    res.body.forEach(function (price) {
                        price.should.be.a('object');
                        price.should.include.keys('price', 'timestamp');
                    });
                    resPrice = res.body[0];
                    return Price.findById(resPrice.id);
                })
                .then(function (price) {
                    resPrice.id.should.equal(price.id);
                    resPrice.price.should.equal(price.price);
                    //resPrice.timestamp.should.equal(price.timestamp);
                });
        }); */
    });
});

