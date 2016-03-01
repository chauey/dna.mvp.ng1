// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AssociateController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, AssociateController);

    // 2. Inject dependencies
    AssociateController.$inject = ['authService', 'common'];

    // #region 3. Define controller
    function AssociateController(authService, common) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var log = getLogFn(controllerId);
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.registerExternal = registerExternal;

        vm.registerData = {
            userName: authService.externalAuthData.userName,
            provider: authService.externalAuthData.provider,
            externalAccessToken: authService.externalAuthData.externalAccessToken
        };

        vm.activate = activate;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController(controllerId)
                .then(function () { log('Activated Account Association View.'); });
        }

        function registerExternal() {
            authService.registerExternal(vm.registerData)
                .then(success).catch(failed);

            function success() {
                log('Account has been registered successfully, redicted to Dashboard in 2 seconds.');
                authService.startTimer('');
            }

            function failed(response) {
                logError('Registration failed: ' + response.message);
            }
        };
        // #endregion
    }
    // #endregion
})();