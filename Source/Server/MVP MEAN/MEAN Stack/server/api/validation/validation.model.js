'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ValidationSchema = new Schema({
    integer: Number,
    string: String,
    date: Date,
    age: Number,
    creditCard: Number,
    email: String,
    phone: String,
    url: String,
    zip: Number
});

ValidationSchema.statics = {
    loadRecent: function (cb) {
        this.find({})
        .limit(20)
        .exec(cb);
    }
};

module.exports = mongoose.model('Validation', ValidationSchema);