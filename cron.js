const CronJob = require('cron').CronJob;
const request = require('request');
const mongoose = require('mongoose');
const { Price } = require('./models/price');
const { DATABASE_URL } = require('./config');

mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

const job = new CronJob({
    cronTime: '1 * * * * *',
    onTick() {
        request('https://www.bitstamp.net/api/v2/ticker/btcusd/', { json: true }, (err, res, body) => {

                if (err) {
                    console.log(err);
                } else {
                    console.log(res.body);
                    Price
                        .create({
                            price: res.body.last,
                            timestamp: res.body.timestamp,
                        });
                }
        });
    },
    start: false,
});

job.start();

// if (collection.length === 1440) {
// Price.remove({})
// }
