'use strict';

angular.module('mvpMeanApp')
  .controller('RoleCtrl', function ($scope, $http, socket) {
    $scope.roles = [];

    $http.get('/api/roles').success(function(roles) {
      $scope.roles = roles;
      socket.syncUpdates('role', $scope.roles);
    });

    $scope.addRole = function() {
      if($scope.newRole === '') {
        return;
      }
      $http.post('/api/roles', { name: $scope.newRole });
      $scope.newRole = '';
    };

    $scope.deleteRole = function(role) {
      $http.delete('/api/roles/' + role._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('role');
    });
  });
