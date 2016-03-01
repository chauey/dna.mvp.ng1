'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MstSchema = new Schema({
    string: String,
    number: Number,
    date: Object,
    boolean: Boolean
    //buffer: Object,
    //mixed: Object,
    //objectId: Object,
    //array: Array(Object)
});

module.exports = mongoose.model('Mst', MstSchema);