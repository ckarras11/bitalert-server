const mongoose = require('mongoose');

const priceSchema = mongoose.Schema({

    price: { type: Number, required: true },
    timestamp: { type: Date, required: true },

});

priceSchema.methods.apiRepr = function () {
    return {
        id: this.id,
        price: this.price,
        timestamp: this.timestamp,
    };
};

const Price = mongoose.model('Price', priceSchema, 'Price');

module.exports = { Price };
