const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL } = require('../config');
const { Price } = require('../models/price');

const should = chai.should();
chai.use(chaiHttp);

function generateData() {
    return {
        price: faker.random.number(),
        timestamp: faker.date.recent(),
    };
}

function seedData() {
    console.info('Seeding Data');
    const seedData = [];
    for (let i = 0; i <= 10; i++) {
        seedData.push(generateData());
    }
    return Price.insertMany(seedData);
}

function tearDown() {
    console.warn('Deleting DB');
    return mongoose.connection.dropDatabase();
}

describe('Testing api/price', function () {
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

    describe('GET /api/price', function () {
        it('should retrieve all the prices from the db', function () {
            let res;
            return chai.request(app)
                .get('/api/price')
                .then(function (_res) {
                    res = _res;
                    res.should.have.status(200);
                    return Price.count();
                })
                .then(function (count) {
                    res.body.length.should.equal(count);
                });
        });
        it('should retrieve vehicles with the correct keys', function () {
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
        });
    });

    describe('POST /api/price', function () {
        it('should create a new alert', function () {
            const newPrice = generateData();
            return chai.request(app)
            .post('/api/price')
            .send(newPrice)
            .then(function (res) {
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('price', 'timestamp');
                res.body.id.should.not.be.null;
                return Price.findById(res.body.id);
            })
            .then(function (price) {
                price.price.should.equal(newPrice.price);
                //price.timestamp.should.equal(newPrice.timestamp);
            });
        });
    });

    describe('DELETE /api/price', function () {
        it('should remove an alert form the db', function () {
            let resPrice;
            return Price
                .findOne()
                .then(function (_price) {
                    resPrice = _price;
                    return chai.request(app).delete(`/api/price/${resPrice.id}`);
                })
                .then(function (res) {
                    res.should.have.status(204);
                    return Price.findById(resPrice.id);
                })
                .then(function (_price) {
                    should.not.exist(_price);
                });
        });
    });
});
