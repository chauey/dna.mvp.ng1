'use strict';

var _ = require('lodash');
var Validation = require('./validation.model');

// Get list of validations
exports.index = function(req, res) {
  Validation.find(function (err, validations) {
    if(err) { return handleError(res, err); }
    return res.json(200, validations);
  });
};

// Get a single validation
exports.show = function(req, res) {
  Validation.findById(req.params.id, function (err, validation) {
    if(err) { return handleError(res, err); }
    if(!validation) { return res.send(404); }
    return res.json(validation);
  });
};

// Creates a new validation in the DB.
exports.create = function(req, res) {
  Validation.create(req.body, function(err, validation) {
    if(err) { return handleError(res, err); }
    return res.json(201, validation);
  });
};

// Updates an existing validation in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Validation.findById(req.params.id, function (err, validation) {
    if (err) { return handleError(res, err); }
    if(!validation) { return res.send(404); }
    var updated = _.merge(validation, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, validation);
    });
  });
};

// Deletes a validation from the DB.
exports.destroy = function(req, res) {
  Validation.findById(req.params.id, function (err, validation) {
    if(err) { return handleError(res, err); }
    if(!validation) { return res.send(404); }
    validation.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}