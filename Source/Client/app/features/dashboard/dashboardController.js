// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'DashboardController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, DashboardController);

    // 2. Inject dependencies
    DashboardController.$inject = ['$scope', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function DashboardController($scope, $http, $timeout,
        common, datacontext) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.typeOfTypeCount = 0;
        // #endregion

        // 3.3. Run activate method

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            activate();
        });

        // #region 3.4. Controller functions implementation
        function activate() {
            var promises = [getTypeOfTypeCount()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View.'); });
        }

        function getTypeOfTypeCount() {
            return datacontext.typeOfType.getCount().then(function (data) {
                return vm.typeOfTypeCount = data;
            });
        }
        // #endregion
    }
    // #endregion
})();