'use strict';

angular.module('angularFullstackApp')
  .controller('PermissionCtrl', function ($scope, $http, socket) {
  $scope.permissions = [];
    
  // Grab the initial set of available permissions
  $http.get('/api/permissions').success(function (permissions) {
    $scope.permissions = permissions;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('permission', $scope.permissions, function (event, permission, permissions) {
      // This callback is fired after the permissions array is updated by the socket listeners
    });
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('permission');
  });

  // Use our rest api to post a new permission
  $scope.addPMS = function () {
    $http.post('/api/permissions',
      {
        value: $scope.pmsValue,
        name: $scope.pmsName,
        description: $scope.pmsDesc,
        isActive: $scope.pmsActive,
        createdOn: Date.now(),
        isDeleted: false
      });
  };

  // Delete permission
  $scope.deletePms = function (permission) {
    $http.delete('/api/permissions/' + permission._id);
  };

  // begin editing a permission, save the original in case of cancel
  $scope.editPms = function (permission) {
    permission.editing = true;
  };

  // update when done editing
  $scope.doneEditing = function (permission) {
    permission.editing = false;
    $http.put('/api/permissions/' + permission._id, permission);
  };
});
