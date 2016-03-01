// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'FormToolController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, FormToolController);

    // 2. Inject dependencies
    FormToolController.$inject = ['$rootScope', '$scope', 'settings', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function FormToolController($rootScope, $scope, settings, $http, $timeout,
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