const CronJob = require('cron').CronJob;
const request = require('request');
const mongoose = require('mongoose');
const { Price } = require('./models/price');
const { Alert } = require('./models/alert');
const { DATABASE_URL, ACCOUNT_SID, AUTH_TOKEN } = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

// Twilio
/* const twilio = require('twilio');
const accountSid = ACCOUNT_SID;
const authToken = AUTH_TOKEN;
const client = new twilio(accountSid, authToken); */

// Fill the database with current market prices every minute
const job1 = new CronJob({
    cronTime: '1 * * * * *',
    onTick() {
        request('https://www.bitstamp.net/api/v2/ticker/btcusd/', { json: true }, (err, res, body) => {

            if (err) {
                console.log(err);
            } else {
                console.log(res.body);
                const date = new Date(res.body.timestamp * 1000);
                return Price
                    .create({
                        price: res.body.last,
                        timestamp: date,
                    });
            }
        });
    },
    start: false,
});
/* 
// Clear the database each day at midnight
const job2 = new CronJob({
    cronTime: '0 0 * * * *',
    onTick() {
        return Price
            .find()
            .then((res) => {
                if (res.length > 1440) {
                    console.log('deleting');
                    return Price;
                }
                console.log('database not full');
                return Promise.reject();
            })
            .then(() => {
                return Price.deleteMany({});
            })
            .then((res) => {
                console.log('Database Cleared');
            });
    },
    start: false,
});

// Flag alert for deletion if its over 24hours old every minute
const job3 = new CronJob({
    cronTime: '1 * * * * *',
    onTick() {
        let currentDate = new Date();
        let expiration = 60 * 60 * 1000 * 24;
        console.log(currentDate);
        Alert
            .findByFlag(false)
            .then((res) => {
                res.forEach((alert) => {
                    // Check if alert is 24 hours old
                    if (currentDate - alert.alert.created > expiration) {
                        console.log(`${alert} is older than 24 hours`);
                        return Alert
                        .update({ _id: alert._id }, { $set: { 'alert.removeFlag': true } })
                        .exec()
                        .then(() => {
                            console.log('Alerts older than 24 hours flagged for deletion');
                        });
                    }
                });
            });
    },
    start: false,
});

// Checks alert price and compare with current price every minute
const job4 = new CronJob({
    cronTime: '1 * * * * *',
    onTick() {
        let marketPrice;
        Price
            .find()
            .then((res) => {
                marketPrice = res[res.length - 1].price;
                console.log(marketPrice);
            });
        Alert
            .findByFlag(false)
            .then((res) => {
                res.forEach((alert) => {
                    if (alert.alert.price > marketPrice) {
                        console.log(alert);
                        // SMS via Twilio
                        client.messages.create({
                            body: `Your alert price of ${alert.alert.price} was triggered!`,
                            to: alert.phoneNumber,  // Text this number
                            from: '+17742373189' // From a valid Twilio number
                        })
                        .then(message => console.log(message.sid));
                        return Alert
                            .update({ _id: alert._id }, { $set: { 'alert.removeFlag': true } })
                            .exec()
                            .then(() => {
                                console.log('Triggered alerts flagged for deletion');
                            });
                    }
                });
            });
    },
    start: false,
});

// Removes alerts with flag true every day at midnight
const job5 = new CronJob({
    cronTime: '0 0 * * * *',
    onTick() {
        return Alert
            .deleteMany({ 'alert.removeFlag': true })
            .then(() => {
                console.log('Removed alerts flagged for deletion');
            });
    },
    start: false,
}); */

job1.start();
// job2.start();
// job3.start();
// job4.start();
// job5.start();