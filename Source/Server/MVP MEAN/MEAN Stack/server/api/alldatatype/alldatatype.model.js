'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AlldatatypeSchema = new Schema({
    bigint: Number,
    bit: Boolean,
    char: String,
    date: Date,
    decimal: Number,
    float: Number,
    int: Number,
    nchar: String,
    numeric: Number,
    nvarchar: String,
    real: Number,
    varchar: String
});

AlldatatypeSchema.statics = {
    loadRecent: function (cb) {
        this.find({})
        .limit(20)
        .exec(cb);
    }
};

module.exports = mongoose.model('Alldatatype', AlldatatypeSchema);