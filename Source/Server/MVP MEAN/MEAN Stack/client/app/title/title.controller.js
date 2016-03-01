'use strict';

angular.module('angularFullstackApp')
  .controller('TitleCtrl', function ($scope, $http, socket) {
  $scope.titles = [];

  $http.get('/api/titles').success(function (titles) {
    $scope.titles = titles;
    socket.syncUpdates('title', $scope.titles);
  });

  $scope.addTitle = function () {
    if ($scope.newtitle === '') {
      return;
    }
    $http.post('/api/titles', { name: $scope.newtitle });
    $scope.newtitle = '';
  };

  $scope.deleteTitle = function (title) {
    $http.delete('/api/titles/' + title._id);
  };

  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('title');
  });
    
  // begin editing a title, save the original in case of cancel
  $scope.editTitle = function (title) {
    title.editing = true;
  };

  // update when done editing
  $scope.doneEditing = function (title) {
    title.editing = false;
    $http.put('/api/titles/' + title._id, title);
  };
});