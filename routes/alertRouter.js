const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Alert } = require('../models/alert');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// Get Alerts by phonenumber from DB
router.get('/', (req, res) => {
    Alert
        .find()
        .then((alerts) => {
            res.status(200).json(alerts.map(alert => alert.apiRepr()));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Create a new Alert
// check for price in alert obj
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['phoneNumber', 'alert'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing ${field} in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    Alert
        .create({
            phoneNumber: req.body.phoneNumber,
            alert: req.body.alert,
        })
        .then(alert => res.status(201).json(alert.apiRepr()))
        .catch((err) => {
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Delete an Alert
router.delete('/:id', (req, res) => {
    Alert
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleting alert ${req.params.id}`);
            res.status(204).end();
        });
});

module.exports = router;
