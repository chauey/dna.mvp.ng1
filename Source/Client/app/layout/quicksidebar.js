(function () {
    'use strict';

    var controllerId = 'quicksidebar';

    angular.module('app.layout').controller(controllerId,
        ['$scope', '$location', 'authService', 'bootstrap.dialog', quicksidebar]);

    function quicksidebar($scope, $location, authService, bsDialog) {

    }
})();
