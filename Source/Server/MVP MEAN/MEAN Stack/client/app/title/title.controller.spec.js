'use strict';

describe('Controller: TitleCtrl', function () {

  // load the controller's module
  beforeEach(module('angularFullstackApp'));

  var TitleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TitleCtrl = $controller('TitleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
