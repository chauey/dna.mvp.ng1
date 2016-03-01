'use strict';

var _ = require('lodash');
var Accesscontrollistitem = require('./accesscontrollistitem.model');

// Get list of accesscontrollistitems
exports.index = function(req, res) {
  Accesscontrollistitem.find(function (err, accesscontrollistitems) {
    if(err) { return handleError(res, err); }
    return res.json(200, accesscontrollistitems);
  });
};

// Get a single accesscontrollistitem
exports.show = function(req, res) {
  Accesscontrollistitem.findById(req.params.id, function (err, accesscontrollistitem) {
    if(err) { return handleError(res, err); }
    if(!accesscontrollistitem) { return res.send(404); }
    return res.json(accesscontrollistitem);
  });
};

// Creates a new accesscontrollistitem in the DB.
exports.create = function(req, res) {
  Accesscontrollistitem.create(req.body, function(err, accesscontrollistitem) {
    if(err) { return handleError(res, err); }
    return res.json(201, accesscontrollistitem);
  });
};

// Updates an existing accesscontrollistitem in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Accesscontrollistitem.findById(req.params.id, function (err, accesscontrollistitem) {
    if (err) { return handleError(res, err); }
    if(!accesscontrollistitem) { return res.send(404); }
    var updated = _.merge(accesscontrollistitem, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, accesscontrollistitem);
    });
  });
};

// Deletes a accesscontrollistitem from the DB.
exports.destroy = function(req, res) {
  Accesscontrollistitem.findById(req.params.id, function (err, accesscontrollistitem) {
    if(err) { return handleError(res, err); }
    if(!accesscontrollistitem) { return res.send(404); }
    accesscontrollistitem.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}