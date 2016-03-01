(function () {
    'use strict';

    var controllerID = "PaymentController";

    angular
        .module('app.features')
        .controller(controllerID, paymentController);

    paymentController.$inject = ['$scope', 'common', 'commonConfig', 'config'];

    function paymentController($scope, common, commonConfig, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerID, 'error');
        var log = getLogFn(controllerID);

        vm.activate = activate;

        activate();

        function activate() {
            common.activateController(controllerID)
                .then(function () { log('Activated Payment View.'); });
        }

        $scope.onSubmit = function () {
        };

        $scope.stripeCallback = function (status, response) {

            if (response.error) {
                // there was an error. Fix it.
            } else {
                // got stripe token, now charge it or smt
                window.alert('success! token: ' + response.id);
            }
        };
    }
})();