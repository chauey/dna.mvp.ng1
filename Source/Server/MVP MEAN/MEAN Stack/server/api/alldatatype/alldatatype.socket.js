/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Alldatatype = require('./alldatatype.model');

exports.register = function(socket) {
  Alldatatype.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Alldatatype.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('alldatatype:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('alldatatype:remove', doc);
}