'use strict';

angular.module('angularFullstackApp')
 .controller('MstCtrl', function ($scope, $http, socket) {
  // Grab the initial set of available msts
  $http.get('/api/msts').success(function (msts) {
    $scope.msts = msts;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('mst', $scope.msts, function (event, mst, msts) {
      // This callback is fired after the msts array is updated by the socket listeners
    });
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('mst');
  });

  // Use our rest api to post a new mst
  $scope.createMst = function () {
    $http.post('/api/msts',
      {
        string: $scope.mstString,
        number: $scope.mstNumber,
        date: $scope.mstDate,
        boolean: $scope.mstBoolean
      });
  };

  // Delete mst
  $scope.deleteMst = function (mst) {
    $http.delete('/api/msts/' + mst._id);
  };

  // begin editing a mst, save the original in case of cancel
  $scope.editMst = function (mst) {
    mst.editing = true;
  };

  // update when done editing
  $scope.doneEditing = function (mst) {
    mst.editing = false;
    $http.put('/api/msts/' + mst._id, mst);
  };
});
