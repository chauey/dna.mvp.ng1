'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TitleSchema = new Schema({
  name: String
});

module.exports = mongoose.model('Title', TitleSchema);