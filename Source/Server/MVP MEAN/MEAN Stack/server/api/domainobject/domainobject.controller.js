'use strict';

var _ = require('lodash');
var Domainobject = require('./domainobject.model');

// Get list of domainobjects
exports.index = function(req, res) {
  Domainobject.find(function (err, domainobjects) {
    if(err) { return handleError(res, err); }
    return res.json(200, domainobjects);
  });
};

// Get a single domainobject
exports.show = function(req, res) {
  Domainobject.findById(req.params.id, function (err, domainobject) {
    if(err) { return handleError(res, err); }
    if(!domainobject) { return res.send(404); }
    return res.json(domainobject);
  });
};

// Creates a new domainobject in the DB.
exports.create = function(req, res) {
  Domainobject.create(req.body, function(err, domainobject) {
    if(err) { return handleError(res, err); }
    return res.json(201, domainobject);
  });
};

// Updates an existing domainobject in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Domainobject.findById(req.params.id, function (err, domainobject) {
    if (err) { return handleError(res, err); }
    if(!domainobject) { return res.send(404); }
    var updated = _.merge(domainobject, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, domainobject);
    });
  });
};

// Deletes a domainobject from the DB.
exports.destroy = function(req, res) {
  Domainobject.findById(req.params.id, function (err, domainobject) {
    if(err) { return handleError(res, err); }
    if(!domainobject) { return res.send(404); }
    domainobject.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}