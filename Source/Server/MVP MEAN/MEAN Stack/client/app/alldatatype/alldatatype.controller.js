'use strict';

angular.module('angularFullstackApp')
  .controller('AlldatatypeCtrl', function ($scope, $http, socket) {
  // Grab the initial set of available alldatatypes
  $http.get('/api/alldatatypes').success(function (alldatatypes) {
    $scope.datatypes = alldatatypes;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('alldatatype', $scope.datatypes, function (event, alldatatype, alldatatypes) {
      // This callback is fired after the alldatatypes array is updated by the socket listeners
    });
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('alldatatype');
  });

  // Use our rest api to post a new alldatatype
  $scope.createDT = function () {
    $http.post('/api/alldatatypes',
      {
        bigint: $scope.adtBigInt,
        bit: $scope.adtBit,
        char: $scope.adtChar,
        date: $scope.adtDate,
        decimal: $scope.adtDecimal,
        float: $scope.adtFloat,
        int: $scope.adtInt,
        nchar: $scope.adtNchar,
        numeric: $scope.adtNumeric,
        nvarchar: $scope.adtNvarchar,
        real: $scope.adtReal,
        varchar: $scope.adtVarchar
      });
  };

  // Delete alldatatype
  $scope.removeDT = function (alldatatype) {
    $http.delete('/api/alldatatypes/' + alldatatype._id);
  };

  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('datatypes');
  });

  // begin editing a alldatatype, save the original in case of cancel
  $scope.editDT = function (alldatatype) {
    alldatatype.editing = true;
    //$scope.editedalldatatype = $scope.alldatatypes[alldatatype._id];
    //$scope.originalalldatatype = angular.extend({}, $scope.editedalldatatype);
  };

  // update when done editing
  $scope.doneEditing = function (alldatatype) {
    alldatatype.editing = false;
    $http.put('/api/alldatatypes/' + alldatatype._id, alldatatype);
    //$scope.content = alldatatype.content;
  };
});
