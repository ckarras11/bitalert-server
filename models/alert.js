const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    phoneNumber: { type: Number, required: true },
    alert: {
        price: { type: Number, required: true },
    },

});

alertSchema.methods.apiRepr = function () {
    return {
        id: this.id,
        phoneNumber: this.phoneNumber,
        alert: this.alert,
    };
};

const Alert = mongoose.model('Alert', alertSchema, 'Alert');

module.exports = { Alert };
