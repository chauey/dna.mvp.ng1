'use strict';

angular.module('angularFullstackApp')
  .controller('AccesscontrollistitemCtrl', function ($scope, $http, socket) {
  $scope.roles = [];
  $scope.domainobjects = [];
  
  // Grab the initial set of available accesscontrollistitems
  $http.get('/api/accesscontrollistitems').success(function (accesscontrollistitems) {
    $scope.accesscontrollistitems = accesscontrollistitems;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('accesscontrollistitem', $scope.accesscontrollistitems, function (event, accesscontrollistitem, accesscontrollistitems) {
      // This callback is fired after the accesscontrollistitems array is updated by the socket listeners
    });
  });

  $http.get('/api/domainobjects').success(function (domainobjects) {
    $scope.domainobjects = domainobjects;
    socket.syncUpdates('domainobject', $scope.domainobjects);
  });

  $http.get('/api/titles').success(function (titles) {
    $scope.titles = titles;
    socket.syncUpdates('role', $scope.titles);
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('accesscontrollistitem');
  });

  // Use our rest api to post a new accesscontrollistitem
  $scope.addAcL = function () {
    $http.post('/api/accesscontrollistitems',
      {
        domainobject: $scope.doId._id,
        titleId: $scope.titleId._id,
        permissionValue: $scope.permissionValue,
        isActive: $scope.isActive,
        createdOn: Date.now(),
        isDeleted: false
      });
  };

  // Delete accesscontrollistitem
  $scope.deleteAcl = function (accesscontrollistitem) {
    $http.delete('/api/accesscontrollistitems/' + accesscontrollistitem._id);
  };

  // begin editing a accesscontrollistitem, save the original in case of cancel
  $scope.editVLD = function (accesscontrollistitem) {
    accesscontrollistitem.editing = true;
  };

  // update when done editing
  $scope.doneEditing = function (accesscontrollistitem) {
    accesscontrollistitem.editing = false;
    $http.put('/api/accesscontrollistitems/' + accesscontrollistitem._id, accesscontrollistitem);
    //$scope.content = accesscontrollistitem.content;
  };
});
