'use strict';

var _ = require('lodash');
var Alldatatype = require('./alldatatype.model');

// Get list of alldatatypes
exports.index = function(req, res) {
  Alldatatype.find(function (err, alldatatypes) {
    if(err) { return handleError(res, err); }
    return res.json(200, alldatatypes);
  });
};

// Get a single alldatatype
exports.show = function(req, res) {
  Alldatatype.findById(req.params.id, function (err, alldatatype) {
    if(err) { return handleError(res, err); }
    if(!alldatatype) { return res.send(404); }
    return res.json(alldatatype);
  });
};

// Creates a new alldatatype in the DB.
exports.create = function(req, res) {
  Alldatatype.create(req.body, function(err, alldatatype) {
    if(err) { return handleError(res, err); }
    return res.json(201, alldatatype);
  });
};

// Updates an existing alldatatype in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Alldatatype.findById(req.params.id, function (err, alldatatype) {
    if (err) { return handleError(res, err); }
    if(!alldatatype) { return res.send(404); }
    var updated = _.merge(alldatatype, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, alldatatype);
    });
  });
};

// Deletes a alldatatype from the DB.
exports.destroy = function(req, res) {
  Alldatatype.findById(req.params.id, function (err, alldatatype) {
    if(err) { return handleError(res, err); }
    if(!alldatatype) { return res.send(404); }
    alldatatype.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}