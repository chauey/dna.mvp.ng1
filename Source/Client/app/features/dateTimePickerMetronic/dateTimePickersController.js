// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'DateTimePickerController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, DateTimePickerController);

    // 2. Inject dependencies
    DateTimePickerController.$inject = ['$rootScope', '$scope', 'settings', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function DateTimePickerController($rootScope, $scope, settings, $http, $timeout,
        common, datacontext) {

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            Metronic.initAjax();

            // set default layout mode
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
        });

    }
    // #endregion

})();