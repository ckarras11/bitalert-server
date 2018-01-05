const CronJob = require('cron').CronJob;
const request = require('request');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { Price } = require('./models/price');
const { Alert } = require('./models/alert');
const { DATABASE_URL, ACCOUNT_SID, AUTH_TOKEN, EMAIL_USER, EMAIL_PASS } = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);


// Twilio
const twilio = require('twilio');
const accountSid = ACCOUNT_SID;
const authToken = AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

// Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Fill the database with current market prices every minute
const job1 = new CronJob({
    cronTime: '5 * * * * *',
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

// Clear the database each day at midnight
const job2 = new CronJob({
    cronTime: '10 0 0 * * *',
    onTick() {
        return Price
            .find()
            .then((res) => {
                if (res.length > 1000) {
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

// Flag alert for deletion if its over 24hours old every hour
const job3 = new CronJob({
    cronTime: '0 0 * * * *',
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
    cronTime: '15 * * * * *',
    onTick() {
        let marketPrice;
        Price
            .find()
            .then((res) => {
                res.sort(function (a, b) {
                    return new Date(a.timestamp) - new Date(b.timestamp);
                });
                marketPrice = res[res.length - 1].price;
                console.log(marketPrice);
            })
            .then(() => {
                Alert
                    .findByFlag(false)
                    .then((res) => {
                        res.forEach((alert) => {
                            if (alert.alert.price > marketPrice) {
                                if (alert.alert.contactType === 'phoneNumber') {
                                    console.log(alert, 'SMS TEXT');
                                    // SMS via Twilio
                                    client.messages.create({
                                        body: `BitAlert - Your alert price of ${alert.alert.price} was triggered!`,
                                        to: alert.phoneNumber, // Text this number
                                        from: '+17742373189', // From a valid Twilio number
                                    })
                                    .then(message => console.log(message.sid));
                                } else if (alert.alert.contactType === 'email') {
                                    console.log(alert, 'email');
                                    const mailOptions = {
                                        from: 'bitalert.notifications@gmail.com', // sender address
                                        to: alert.email, // list of receivers
                                        subject: 'BitAlert Notification', // Subject line
                                        html: ` <img src='cid:unique@kreata.ee'>
                                                <h2>Your price alert of $${alert.alert.price} was triggered</h2>
                                                <a href='https://bitalert.netlify.com/'>Create more notifications here!</a>`,
                                        attachments: [{
                                            filename: '34591541-5d14a7e8-f18c-11e7-8f11-6084ffc60658.png',
                                            path: 'https://user-images.githubusercontent.com/30561347/34591541-5d14a7e8-f18c-11e7-8f11-6084ffc60658.png',
                                            cid: 'unique@kreata.ee', // same cid value as in the html img src
                                        }], // plain text body
                                    };
                                    transporter.sendMail(mailOptions, function (err, info) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            console.log(info);
                                        }
                                    });
                                }
                                return Alert
                                    .update({ _id: alert._id }, { $set: { 'alert.removeFlag': true } })
                                    .exec()
                                    .then(() => {
                                        console.log('Triggered alerts flagged for deletion');
                                    });
                            }
                        });
                    });
            });
    },
    start: false,
});

// Removes alerts with flag true every day at midnight
const job5 = new CronJob({
    cronTime: '10 0 0 * * *',
    onTick() {
        return Alert
            .deleteMany({ 'alert.removeFlag': true })
            .then(() => {
                console.log('Removed alerts flagged for deletion');
            });
    },
    start: false,
});

// job1.start();
// job2.start();
// job3.start();
// job4.start();
// job5.start();
