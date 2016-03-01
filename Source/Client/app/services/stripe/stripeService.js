(function () {
    'use strict';

    var serviceId = 'stripeService';

    angular.module('app.services.stripe').factory(serviceId,
        ['$http', '$location', '$q', '$timeout',
            'config', 'localStorageService', 'zStorage', stripeService]);

    function stripeService($http, $location, $q, $timeout,
        config, localStorageService, zStorage) {

        var authentication = {
            isAuth: false,
            userName: "",
            useRefreshTokens: false
        };

        var stripeApi = {
            plans: 'api/Stripe/Plans',
            customer: 'api/Stripe/Customer',
            updateSubscription: 'api/Stripe/UpdateSubscription'
        };

        var service = {
            getStripePlans: getStripePlans,
            getStripeCustomer: getStripeCustomer
        };

        return service;

        function getStripePlans() {
            return $http.get(stripeApi.plans).then(function (response) {
                return response;
            });
        }

        function getStripeCustomer(stripeCustomerID) {
            return $http.get(stripeApi.customer, {
                params: {
                    stripeCustomerID: stripeCustomerID
                }
            }).then(function (response) {
                return response;
            });
        }
    }
})();