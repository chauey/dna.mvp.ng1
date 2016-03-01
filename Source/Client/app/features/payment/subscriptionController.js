(function () {
    'use strict';

    var controllerID = "SubscriptionController";

    angular
        .module('app.features')
        .controller(controllerID, paymentController);

    paymentController.$inject = ['$scope', '$location', 'common', 'commonConfig', 'config', 'authService', 'accountService'];

    function paymentController($scope, $location, common, commonConfig, config, authService, accountService) {

        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerID, 'error');
        var log = getLogFn(controllerID);

        vm.account = {
            userName: '',
            id: '',
            email: '',
            phoneNumber: ''
        };
        vm.authentication = authService.authentication;
        vm.plans = [];
        vm.logins = [];
        vm.stripeCustomerInfos = {
            currentSubscriptionPlanId: '',
            hasCreditCard: false,
            hasStripeRegistered: false
        };
        vm.subscribe = subscribe;
        vm.checkCurrentSubscription = checkCurrentSubscription;

        //vm.externalProviders = ['Facebook', 'Google', 'LinkedIn', 'Microsoft', 'Twitter', 'Yahoo'];
        vm.externalProviders = ['Facebook', 'Google'];

        vm.activate = activate;

        activate();

        function activate() {
            if (!vm.authentication.isAuth) {
                $location.path('/login');
            }

            common.activateController([getPlans(), getStripeCustomerInfos()], controllerID)
                .then(function () { log('Activated Subscription View.'); });
        }

        function getUserInfo() {
            accountService.getUserInfo()
                .then(success).catch(failed);

            function success(response) {

                var data = response.data;

                if (data == null || data == 'null') {
                    authService.logout();
                    return $location.path('/login');
                }

                for (var j = 0; j < data.logins.length; j++) {
                    // update password section if you has local account
                    if (data.logins[j].loginProvider == 'Local') {
                        vm.hasLocalPassword = true;
                        vm.passwordSection = 'Change Password';
                    }

                    // remove externalProviders that user has already in the add login section
                    vm.externalProviders.forEach(function (provider) {
                        if (provider.indexOf(data.logins[j].loginProvider) > -1) {
                            var index = vm.externalProviders.indexOf(provider);
                            vm.externalProviders.splice(index, 1);
                        }
                    });
                }
                for (var i = 0; i < data.logins.length; i++) {
                    vm.logins.push(data.logins[i]);
                }
                vm.account = data.account;
                vm.stripe = data.stripe;
            }

            function failed(response) {
                logError('Retrieved user information failed: ' + response.message + '.');
            }
        }

        function getPlans() {
            return accountService.getStripePlans()
				.then(function (response) {
                    vm.plans = response.data.plans;
				}
			);
        }

        function getStripeCustomerInfos() {
            return accountService.getStripeCustomerInfos().then(function (response) {
                var data = response.data;

                if (data == null || data == 'null') {
                    authService.logout();
                    return $location.path('/login');
                }

                vm.stripeCustomerInfos = data;
            });
        }

        function checkCurrentSubscription(planId) {
            return planId == vm.stripeCustomerInfos.currentSubscriptionPlanID;
        }

        function subscribe(planId) {

            if (!vm.stripeCustomerInfos.hasCreditCard) {
                // navigate to RegisterStripe view for adding new Card
                return $location.path('/addCard/' + planId);
            }

            var subscription = {
                newPlanID: planId
            };

            accountService.updateSubscription(subscription).then(function(response) {
                var data = response.data;

                if (data == null || data == 'null') {
                    authService.logout();
                    return $location.path('/login');
                }

                // refresh stripe customer infos (included new subscription-plan)
                vm.stripeCustomerInfos = data;
            }).catch(function(error) {
                log(error);
            });
        }
    }
})();