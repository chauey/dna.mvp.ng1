/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Permission = require('./permission.model');

exports.register = function(socket) {
  Permission.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Permission.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('permission:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('permission:remove', doc);
}