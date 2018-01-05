const mongoose = require('mongoose');

const alertSchema = mongoose.Schema({
    phoneNumber: { type: String },
    email: { type: String },
    alert: {
        price: { type: Number, required: true },
        removeFlag: { type: Boolean, required: true },
        created: { type: Date, required: true },
        contactType: { type: String, required: true },
    },

});

alertSchema.methods.apiRepr = function () {
    return {
        id: this.id,
        phoneNumber: this.phoneNumber,
        email: this.email,
        alert: this.alert,
    };
};

alertSchema.statics.findByFlag = function (flag) {
    return this.find({ 'alert.removeFlag': flag });
};

const Alert = mongoose.model('Alert', alertSchema, 'Alert');

module.exports = { Alert };
