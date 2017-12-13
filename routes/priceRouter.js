const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Price } = require('../models/price');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// Get Price from DB
router.get('/', (req, res) => {
    Price
        .find()
        .then((prices) => {
            res.status(200).json(prices.map(price => price.apiRepr()));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});


module.exports = router;
