/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Title = require('./title.model');

exports.register = function(socket) {
  Title.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Title.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('title:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('title:remove', doc);
}