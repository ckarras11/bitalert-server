const mongoose = require('mongoose');

const priceSchema = mongoose.Schema({
    marketPrice: [{
        price: { type: Number, required: true },
        timestamp: { type: Number, required: true },
    }],
});

priceSchema.methods.apiRepr = function () {
    return {
        id: this.id,
        marketPrice: this.marketPrice,
    };
};

const Price = mongoose.model('Price', priceSchema, 'Price');

module.exports = { Price };
