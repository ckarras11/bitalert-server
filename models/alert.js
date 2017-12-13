const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    phoneNumber: { type: Number, required: true },
    alerts: [{
        price: { type: Number, required: true },
    }],

});

alertSchema.methods.apiRepr = function () {
    return {
        id: this.id,
        phoneNumber: this.phoneNumber,
        alerts: this.alerts,
    };
};

const Alert = mongoose.model('Alert', alertSchema, 'Alert');

module.exports = { Alert };
