'use strict';

describe('Controller: AlldatatypeCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var AlldatatypeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AlldatatypeCtrl = $controller('AlldatatypeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
