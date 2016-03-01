(function () {
/**
 * @description
 * 
 * Account service acts as a bridge to transfer data between
 * client-side controllers and the server Account API Controller through $http calls.
 */

    'use strict';

    var serviceId = 'accountService';

    angular.module('app.services.membership').factory(serviceId,
        ['$http', 'config', accountService]);

    function accountService($http, config) {

        // APIs to connect to Server
        var _baseUrl = config.remoteServiceName;
        var _baseApiUrl = _baseUrl + "api/Account/";

        var accountApi = {
            getUserInfo: 'api/Account/GetUserInfo',
            updateUserInfo: 'api/Account/UpdateUserInfo',
            changePassword: 'api/Account/ChangePassword',
            setPassword: 'api/Account/SetPassword',
            addLogin: 'api/Account/AddLogin',
            removeLogin: 'api/Account/RemoveLogin',
            resetPassword: _baseApiUrl + 'ResetPassword',

            subscribe: 'api/Account/Subscribe',
            getStripeCustomerInfos: 'api/Account/UserCurrentSubscriptionPlan',
            updateSubscription: 'api/Account/UpdateSubscription',
            getPlans: 'api/Account/GetPlans',
            getUserCards: 'api/Account/GetUserCards',
            addUserCard: 'api/Account/addUserCard'
        }

        var service = {
            getUserInfo: getUserInfo,
            updateUserInfo: updateUserInfo,
            changePassword: changePassword,
            setPassword: setPassword,
            addLogin: addLogin,
            removeLogin: removeLogin,
            resetPassword: resetPassword,

            subscribe: subscribe,
            getStripeCustomerInfos: getStripeCustomerInfos,
            updateSubscription: updateSubscription,
            getPlans: getPlans,
            getUserCards: getUserCards,
            addUserCard: addUserCard
        };

        return service;

        function getUserInfo() {
            return $http.get(accountApi.getUserInfo)
                .then(function (response) {
                return response;
            });
        }

        function updateUserInfo(userInfo) {
            return $http.post(accountApi.updateUserInfo, userInfo)
                .then(function (response) {
                    return response;
                });
        }

        function changePassword(passwordData) {
            return $http.post(accountApi.changePassword, passwordData)
                .then(function (response) {
                return response;
            });
        }

        function resetPassword(resetPwData) {
            return $http.post(accountApi.resetPassword, resetPwData)
                .then(function (response) {
                    return response;
                });
        }

        function setPassword(passwordData) {
            return $http.post(accountApi.setPassword, passwordData)
                .then(function (response) {
                    return response;
                });
        }

        function addLogin(loginData) {
            return $http.post(accountApi.addLogin, loginData)
                .then(function (response) {
                    return response;
                });
        }

        function removeLogin(loginData) {
            return $http.post(accountApi.removeLogin, loginData)
                .then(function (response) {
                    return response;
                });
        }

        function subscribe(subscription) {
            return $http.post(accountApi.subscribe, subscription).then(function (response) {
                return response;
            });
        }

        function updateSubscription(subscription) {
            return $http.post(accountApi.updateSubscription, subscription)
                .then(function(response) {
                    return response;
                });
        }

        function getStripeCustomerInfos() {
            return $http.get(accountApi.getStripeCustomerInfos)
                .then(function (response) {
                    return response;
                });
        }

        function getPlans() {
            return $http.get(accountApi.getPlans).then(function (response) {
                return response;
            });
        }

        function getUserCards() {
            return $http.get(accountApi.getUserCards)
                .then(function (response) {
                    return response;
                });
        }

        function addUserCard(cardToken) {
            return $http.post(accountApi.addUserCard, cardToken).then(function(response) {
                return response;
            });
        }
    }
})();