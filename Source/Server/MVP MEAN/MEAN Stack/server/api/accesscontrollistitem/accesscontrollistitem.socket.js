/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Accesscontrollistitem = require('./accesscontrollistitem.model');

exports.register = function(socket) {
  Accesscontrollistitem.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Accesscontrollistitem.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('accesscontrollistitem:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('accesscontrollistitem:remove', doc);
}