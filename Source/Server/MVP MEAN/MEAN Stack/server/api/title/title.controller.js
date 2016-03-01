'use strict';

var _ = require('lodash');
var Title = require('./title.model');

// Get list of titles
exports.index = function(req, res) {
  Title.find(function (err, titles) {
    if(err) { return handleError(res, err); }
    return res.json(200, titles);
  });
};

// Get a single title
exports.show = function(req, res) {
  Title.findById(req.params.id, function (err, title) {
    if(err) { return handleError(res, err); }
    if(!title) { return res.send(404); }
    return res.json(title);
  });
};

// Creates a new title in the DB.
exports.create = function(req, res) {
  Title.create(req.body, function(err, title) {
    if(err) { return handleError(res, err); }
    return res.json(201, title);
  });
};

// Updates an existing title in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Title.findById(req.params.id, function (err, title) {
    if (err) { return handleError(res, err); }
    if(!title) { return res.send(404); }
    var updated = _.merge(title, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, title);
    });
  });
};

// Deletes a title from the DB.
exports.destroy = function(req, res) {
  Title.findById(req.params.id, function (err, title) {
    if(err) { return handleError(res, err); }
    if(!title) { return res.send(404); }
    title.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}