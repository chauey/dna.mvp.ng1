// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AddCardController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, addCardController);

    // 2. Inject dependencies
    addCardController.$inject = ['$scope', '$location', '$stateParams', '$rootScope', '$window', 'common', 'accountService'];
    // #region 3. Define controller
    function addCardController($scope, $location, $stateParams, $rootScope, $window, common, accountService) {
        $scope.addNewCard = $stateParams.id === 'new';
        $scope.setAsDefault = false;

        $scope.stripeCallback = function (code, result) {

            if (result.error) {
                logError('Stripe returns an error when trying to validate your card. code: ' + code + ' - ' + result.error.message);
            } else {
                var cardToken = {
                    setAsDefaultCard: $scope.setAsDefault,
                    token: result.id
                };

                if ($scope.addNewCard) {

                    // add new payment information (credit-card) for user.
                    accountService.addUserCard(cardToken).then(function (response) {
                        $location.path('/payment');
                    });
                } else {
                    var subscription = {
                        token: result.id,
                        newPlanID: $stateParams.id
                    };

                    // user enter his/her card to upgrade their subscription. 
                    accountService.updateSubscription(subscription).then(function (response) {
                        $location.path('/subscription');
                    });
                }
            }
        }


        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        // #endregion

        

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalcard = null;


        vm.goBack = goBack;
        vm.delete = deleteCard;
        vm.stripeCallback = stripeCallback;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then();
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            $window.history.back();
        }

        function stripeCallback(code, result) {
            
        }

        function goTocards() {
            $location.path('/payment');
        }

        function deleteCard() {
        }
        //#endregion
    }
    // #endregion
})();

