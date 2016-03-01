// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'ManagePaymentController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, managePaymentController);

    // 2. Inject dependencies
    managePaymentController.$inject = ['$location', 'common', 'config', 'authService', 'accountService'];

    // #region 3. Define controller
    function managePaymentController($location, common, config, authService, accountService) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        vm.authentication = authService.authentication;

        // #endregion

        // #region 3.2. Define bindable variables to the view
        // #region Breeze client-side cached
        vm.cards = [];

        vm.title = 'cards';
        vm.goTocard = goTocard;
        vm.theads = ['Last4']; // Table headers
        // #endregion

        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            // Log-in Required
            if (!vm.authentication.isAuth) {
                return $location.path('/login');
            }

            common.activateController([getcards()], controllerId)
				.then(function () { log('Activated Cards View.'); });
        }

        function getcards() {
            return accountService.getUserCards()
				.then(function (response) {
				    vm.cards = response.data;
				}
			);
        }

        function goTocard(card) {
            if (card && card.id) {
                $location.path('/addCard/' + card.id);
            }
        }




        // #endregion
    }
    // #endregion
})();