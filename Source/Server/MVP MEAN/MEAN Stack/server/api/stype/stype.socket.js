/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Stype = require('./stype.model');

exports.register = function(socket) {
  Stype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Stype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('stype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('stype:remove', doc);
}