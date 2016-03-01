/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Domainobject = require('./domainobject.model');

exports.register = function(socket) {
  Domainobject.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Domainobject.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('domainobject:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('domainobject:remove', doc);
}