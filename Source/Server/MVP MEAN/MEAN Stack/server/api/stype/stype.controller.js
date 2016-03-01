'use strict';

var _ = require('lodash');
var Stype = require('./stype.model');

// Get list of stypes
exports.index = function(req, res) {
  Stype.find(function (err, stypes) {
    if(err) { return handleError(res, err); }
    return res.json(200, stypes);
  });
};

// Get a single stype
exports.show = function(req, res) {
  Stype.findById(req.params.id, function (err, stype) {
    if(err) { return handleError(res, err); }
    if(!stype) { return res.send(404); }
    return res.json(stype);
  });
};

// Creates a new stype in the DB.
exports.create = function(req, res) {
  Stype.create(req.body, function(err, stype) {
    if(err) { return handleError(res, err); }
    return res.json(201, stype);
  });
};

// Updates an existing stype in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Stype.findById(req.params.id, function (err, stype) {
    if (err) { return handleError(res, err); }
    if(!stype) { return res.send(404); }
    var updated = _.merge(stype, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, stype);
    });
  });
};

// Deletes a stype from the DB.
exports.destroy = function(req, res) {
  Stype.findById(req.params.id, function (err, stype) {
    if(err) { return handleError(res, err); }
    if(!stype) { return res.send(404); }
    stype.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}