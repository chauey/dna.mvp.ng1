'use strict';

angular.module('angularFullstackApp')
 .controller('ValidationCtrl', function ($scope, $http, socket) {
  // Grab the initial set of available validations
  $http.get('/api/validations').success(function (validations) {
    $scope.validations = validations;

    // Update array with any new or deleted items pushed from the socket
    socket.syncUpdates('validation', $scope.validations, function (event, validation, validations) {
      // This callback is fired after the validations array is updated by the socket listeners
    });
  });

  // Clean up listeners when the controller is destroyed
  $scope.$on('$destroy', function () {
    socket.unsyncUpdates('validation');
  });

  // Use our rest api to post a new validation
  $scope.createVld = function () {
    $http.post('/api/validations',
      {
        integer: $scope.vldInteger,
        string: $scope.vldString,
        date: $scope.vldDate,
        age: $scope.vldAge,
        creditCard: $scope.vldCC,
        email: $scope.vldEmail,
        phone: $scope.vldPhone,
        url: $scope.vldUrl,
        zip: $scope.vldZip
      });
  };

  // Delete validation
  $scope.removeVld = function (validation) {
    $http.delete('/api/validations/' + validation._id);
  };

//  $scope.$on('$destroy', function () {
//    socket.unsyncUpdates('validations');
//  });

  // begin editing a validation, save the original in case of cancel
  $scope.editVLD = function (validation) {
    validation.editing = true;
    //$scope.editedvalidation = $scope.validations[validation._id];
    //$scope.originalvalidation = angular.extend({}, $scope.editedvalidation);
  };

  // update when done editing
  $scope.doneEditing = function (validation) {
    validation.editing = false;
    $http.put('/api/validations/' + validation._id, validation);
    //$scope.content = validation.content;
  };
});
