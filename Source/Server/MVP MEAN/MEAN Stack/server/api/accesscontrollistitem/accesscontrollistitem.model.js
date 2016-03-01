'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var AccesscontrollistitemSchema = new Schema({
  permissionValue: Number,
  isActive: Boolean,
  createdBy: String,
  updatedBy: String,
  createdOn: Date,
  updatedOn: Date,
  isDeleted: Boolean,
  deletedOn: Date,
  domainobject:
  {
    type: Schema.Types.ObjectId,
    ref: 'Domainobject'
  },
  title: {
    type: Schema.Types.ObjectId,
    ref: 'Title'
  }
});

AccesscontrollistitemSchema.statics = {
  loadRecent: function (cb) {
    this.find({})
      .populate({ path: 'title', select: 'name' })
      .populate({ path: 'domainobject', select: 'name' })
      .exec(cb);
  }
};

module.exports = mongoose.model('Accesscontrollistitem', AccesscontrollistitemSchema);