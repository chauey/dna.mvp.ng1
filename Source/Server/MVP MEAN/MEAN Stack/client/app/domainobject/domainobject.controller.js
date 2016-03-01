'use strict';

angular.module('angularFullstackApp')
 .controller('DomainobjectCtrl', function ($scope, $http, socket) {
    $scope.domainobjects = [];
    
  // Grab the initial set of available domainobjects
  $http.get('/api/domainobjects').success(function (domainobjects) {
    $scope.domainobjects = domainobjects;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('domainobject', $scope.domainobjects, function (event, domainobject, domainobjects) {
      // This callback is fired after the domainobjects array is updated by the socket listeners
    });
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('domainobject');
  });

  // Use our rest api to post a new domainobject
  $scope.addDO = function () {
    $http.post('/api/domainobjects',
      {
        name: $scope.doName,
        description: $scope.doDesc,
        isActive: $scope.doActive,
        createdOn: Date.now(),
        isDeleted: false
      });
  };

  // Delete domainobject
  $scope.deleteDO = function (domainobject) {
    $http.delete('/api/domainobjects/' + domainobject._id);
  };

  // begin editing a domainobject, save the original in case of cancel
  $scope.editDO = function (domainobject) {
    domainobject.editing = true;
  };

  // update when done editing
  $scope.doneEditing = function (domainobject) {
    domainobject.editing = false;
    $http.put('/api/domainobjects/' + domainobject._id, domainobject);
  };
});
