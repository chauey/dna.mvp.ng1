'use strict';

var _ = require('lodash');
var Permission = require('./permission.model');

// Get list of permissions
exports.index = function(req, res) {
  Permission.find(function (err, permissions) {
    if(err) { return handleError(res, err); }
    return res.json(200, permissions);
  });
};

// Get a single permission
exports.show = function(req, res) {
  Permission.findById(req.params.id, function (err, permission) {
    if(err) { return handleError(res, err); }
    if(!permission) { return res.send(404); }
    return res.json(permission);
  });
};

// Creates a new permission in the DB.
exports.create = function(req, res) {
  Permission.create(req.body, function(err, permission) {
    if(err) { return handleError(res, err); }
    return res.json(201, permission);
  });
};

// Updates an existing permission in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Permission.findById(req.params.id, function (err, permission) {
    if (err) { return handleError(res, err); }
    if(!permission) { return res.send(404); }
    var updated = _.merge(permission, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, permission);
    });
  });
};

// Deletes a permission from the DB.
exports.destroy = function(req, res) {
  Permission.findById(req.params.id, function (err, permission) {
    if(err) { return handleError(res, err); }
    if(!permission) { return res.send(404); }
    permission.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}