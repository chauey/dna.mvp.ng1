(function () {
/**
 * @description
 * 
 * Authentication service used to capture each request before sending it so we can set the bearer token, 
 * as well we are interested in checking if the response from back-end API contains errors, 
 * which means we need to check the error code returned so if its 401 then we redirect the user to the log-in page.
 * http://bitoftech.net/2014/07/16/enable-oauth-refresh-tokens-angularjs-app-using-asp-net-web-api-2-owin/
 * 
 */

    'use strict';

    var serviceId = 'authInterceptorService';

    angular.module('app.services.membership').factory(serviceId,
        ['$q', '$location', 'localStorageService', '$injector', authInterceptorService]);

    function authInterceptorService($q, $location, localStorageService, $injector) {
        var authInterceptorServiceFactory = {};

        // method “_request” will be fired before $http sends the request to the back-end API, 
        // so this is the right place to read the token from local storage and set it 
        // into “Authorization” header with each request
        var _request = function(config) {
            config.headers = config.headers || {};

            var authData = localStorageService.get('authorizationData');
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.token;
            }

            return config;
        }

        // “_responseError” will be hit after the we receive a response from the Back-end API 
        // and only if there is failure status returned. So we need to check the status code, 
        // in case it was 401 we’ll redirect the user to the log-in page 
        var _responseError = function (rejection) {
            
            var deferred = $q.defer();
            if (rejection.status === 401) {

                //var authData = localStorageService.get('authorizationData');
                //if (authData)
                //{
                //    var authService = $injector.get('authService');
                //    authService.refreshToken().then(function (response) {
                //        _retryHttpRequest(rejection.config, deferred);
                //    }, function () {
                //        authService.logOut();
                //        $location.path('/membership/login.html');
                //        deferred.reject(rejection);
                //    });
                //}
                //else {
                //    $location.path('/../../features/membership/login.html');
                //    deferred.reject(rejection);
                //} 

                // Warning to user that it's not authorized
                console.log("Unauthorized. No permission on: " + rejection.config.url);

                var authData = localStorageService.get('authorizationData');
                if (authData) {
                    //config.headers.Authorization = 'Bearer ' + authData.token;

                    // Log unauthorize message
                    console.log("Unauthorized. No permission on: " + rejection.config.url);
                }
                else {
                    $location.path('/login');
                }

                return $q.reject(rejection);
            } else {
                deferred.reject(rejection);
            }
            return deferred.promise;
        }

        var _retryHttpRequest = function (config, deferred) {
            $http = $http || $injector.get('$http');
            $http(config).then(function (response) {
                deferred.resolve(response);
            }, function (response) {
                deferred.reject(response);
            });
        }

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;
    }
})();