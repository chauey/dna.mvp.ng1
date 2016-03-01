'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StypeSchema = new Schema({
    string: String,
    number: Number,
    date: Object,
    //buffer: Object,
    boolean: Boolean
    //mixed: Object,
    //objectId: Object,
    //array: Array(Object)
});

module.exports = mongoose.model('Stype', StypeSchema);