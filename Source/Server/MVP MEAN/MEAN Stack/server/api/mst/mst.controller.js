'use strict';

var _ = require('lodash');
var Mst = require('./mst.model');

// Get list of msts
exports.index = function(req, res) {
  Mst.find(function (err, msts) {
    if(err) { return handleError(res, err); }
    return res.json(200, msts);
  });
};

// Get a single mst
exports.show = function(req, res) {
  Mst.findById(req.params.id, function (err, mst) {
    if(err) { return handleError(res, err); }
    if(!mst) { return res.send(404); }
    return res.json(mst);
  });
};

// Creates a new mst in the DB.
exports.create = function(req, res) {
  Mst.create(req.body, function(err, mst) {
    if(err) { return handleError(res, err); }
    return res.json(201, mst);
  });
};

// Updates an existing mst in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Mst.findById(req.params.id, function (err, mst) {
    if (err) { return handleError(res, err); }
    if(!mst) { return res.send(404); }
    var updated = _.merge(mst, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, mst);
    });
  });
};

// Deletes a mst from the DB.
exports.destroy = function(req, res) {
  Mst.findById(req.params.id, function (err, mst) {
    if(err) { return handleError(res, err); }
    if(!mst) { return res.send(404); }
    mst.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}