'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DomainobjectSchema = new Schema({
  name: String,
  description: String,
  isActive: Boolean,
  createdBy: String,
  updatedBy: String,
  createdOn: Date,
  updatedOn: Date,
  isDeleted: Boolean,
  deletedOn: Date
});

module.exports = mongoose.model('Domainobject', DomainobjectSchema);