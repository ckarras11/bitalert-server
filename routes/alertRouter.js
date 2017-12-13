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
router.post('/', (req, res) => {
    
});

// Delete an Alert
router.delete('/', (req, res) => {

});

module.exports = router;
