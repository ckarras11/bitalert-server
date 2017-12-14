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

// Add a Price to the DB
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['price', 'timestamp'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    Price
        .create({
            price: req.body.price,
            timestamp: req.body.timestamp,
        })
        .then(price => res.status(201).json(price.apiRepr()))
        .catch((err) => {
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Remove Prices from DB
router.delete('/:id', (req, res) => {
    Price
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleting alert ${req.params.id}`);
            res.status(204).end();
        });
});

module.exports = router;
