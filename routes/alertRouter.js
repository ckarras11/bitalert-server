const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Alert } = require('../models/alert');

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

// Get Alerts by phone Number
router.get('/phone/:phoneNumber', (req, res) => {
    const number = req.params.phoneNumber.replace(/\D/g, '');
    console.log(number);
    return Alert
        .find({ phoneNumber: number })
        .then((alerts) => {
            res.status(200).json(alerts.map(alert => alert.apiRepr()));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Get Alerts by email
router.get('/email/:email', (req, res) => {
    const email = req.params.email;
    console.log('getting email')
    console.log(email);
    return Alert
        .find({ email })
        .then((alerts) => {
            res.status(200).json(alerts.map(alert => alert.apiRepr()));
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Create a new Alert
router.post('/', jsonParser, (req, res) => {
    if (!req.body.hasOwnProperty('phoneNumber') && !req.body.hasOwnProperty('email')) {
        let message = 'Missing phoneNumber or email in request body';
        console.error(message);
        return res.status(400).send(message);
    }

    if (!req.body.hasOwnProperty('alert')) {
        let message = 'Missing alert in request body';
        console.error(message);
        return res.status(400).send(message);
    }
    const { alert } = req.body;
    if (!alert.hasOwnProperty('price')) {
        let message = 'Missing key in alert body';
        console.error(message);
        return res.status(400).send(message);
    }
    if (!alert.hasOwnProperty('contactType')) {
        let message = 'Missing key in alert body';
        console.error(message);
        return res.status(400).send(message);
    }

    return Alert
        .create({
            phoneNumber: req.body.phoneNumber,
            email: req.body.email,
            alert: {
                price: req.body.alert.price,
                contactType: req.body.alert.contactType,
                removeFlag: false,
                created: new Date(),
            },
        })
        .then(alert => res.status(201).json(alert.apiRepr()))
        .catch((err) => {
            res.status(500).json({ error: 'Something went wrong' });
        });
});

// Delete an Alert
router.delete('/:id', (req, res) => {
    return Alert
        .findByIdAndRemove(req.params.id)
        .then(() => {
            console.log(`Deleting alert ${req.params.id}`);
            res.status(204).end();
        });
});

module.exports = router;
