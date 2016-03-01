'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PermissionSchema = new Schema({
  value: Number,
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

module.exports = mongoose.model('Permission', PermissionSchema);