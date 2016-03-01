'use strict';

describe('Controller: ValidationCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var ValidationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ValidationCtrl = $controller('ValidationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
