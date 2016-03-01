'use strict';

describe('Controller: AccesscontrollistitemCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var AccesscontrollistitemCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AccesscontrollistitemCtrl = $controller('AccesscontrollistitemCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
