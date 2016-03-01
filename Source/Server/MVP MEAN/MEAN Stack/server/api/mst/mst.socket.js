/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Mst = require('./mst.model');

exports.register = function(socket) {
  Mst.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Mst.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('mst:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('mst:remove', doc);
}