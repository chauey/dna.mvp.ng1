'use strict';

describe('Controller: DomainobjectCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var DomainobjectCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DomainobjectCtrl = $controller('DomainobjectCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
