/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Validation = require('./validation.model');

exports.register = function(socket) {
  Validation.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Validation.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('validation:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('validation:remove', doc);
}