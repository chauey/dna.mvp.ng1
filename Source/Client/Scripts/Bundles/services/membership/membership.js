(function () {
/**
 * @description
 * 
 * Authentication service, responsive for
 * - Register new local and external accounts.
 * - Log-in, log-out registered users.
 * - Store generated token in client local storage.
 */

    'use strict';

    var serviceId = 'authService';

    angular.module('app.services.membership').factory(serviceId,
        ['$http', '$location', '$q', '$timeout',
            'config', 'localStorageService', 'zStorage', authService]);

    function authService($http, $location, $q, $timeout,
        config, localStorageService, zStorage) {

        var authentication = {
            isAuth: false,
            userName: "",
            useRefreshTokens: false,
            roleId: 0
        };

        var accountApi = {
            token: '/Token',
            register: 'api/Account/Register',
            login: 'api/Account/Login',
            obtainAccessToken: 'api/Account/ObtainLocalAccessToken',
            registerExternal: 'api/Account/RegisterExternal'
        }

        var externalAuthData = {
            provider: "",
            userName: "",
            externalAccessToken: ""
        };

        var service = {
            register: register,
            login: login,
            logout: logout,
            fillAuthData: fillAuthData,
            authentication: authentication,

            refreshToken: refreshToken,
            obtainAccessToken: obtainAccessToken,
            externalAuthData: externalAuthData,
            registerExternal: registerExternal,

            startTimer: startTimer
        };

        return service;

        function register(registration) {
            logout();

            return $http.post(accountApi.register, registration).then(function (response) {
                return response;
            });
        }

        function logout() {
            
            localStorageService.remove('authorizationData');

            authentication.isAuth = false;
            authentication.userName = "";
            authentication.roleId = 0;

            localStorageService.clearAll();
            zStorage.clear();
        };

        // Validate the credentials passed and if they are valid it will return an “access_token”
        function login(loginData) {
            var data = "grant_type=password&username=" + loginData.userName 
                + "&password=" + loginData.password + "&client_id=86b6477804ce4ec8b3a17c775160b346";
            
            if (loginData.useRefreshTokens) {
                data = data + "&client_id="
                    + ((provider == 'Facebook') ? config.facebookAuthClientId : ((provider == 'Google') ? config.googleAuthClientId : ''));
            }

            var deferred = $q.defer();
            
            $http.post(accountApi.token, data, {
                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).success(function (response) {

                // store this token into persistence medium on the client
                if (loginData.useRefreshTokens) {
                    localStorageService.set('authorizationData', {
                        token: response.access_token, 
                        userName: loginData.userName, 
                        refreshToken: response.refresh_token, 
                        useRefreshTokens: true
                    });
                }
                else {
                    localStorageService.set('authorizationData', {
                        token: response.access_token, 
                        userName: loginData.userName, 
                        refreshToken: "",
                        useRefreshTokens: false
                    });
                }

                authentication.isAuth = true;
                authentication.userName = loginData.userName;
                authentication.useRefreshTokens = loginData.useRefreshTokens;
                authentication.roleId = loginData.roleId;

                deferred.resolve(response);

            }).error(function (error, status) {
                logout();
                deferred.reject(error);
            });

            return deferred.promise;
        };

        function startTimer(path, immediate) {
            var countdown = 2000;
            if (immediate) { countdown = 0; }

            var timer = $timeout(function () {
                $timeout.cancel(timer);
                $location.path('/' + path);
            }, countdown);
        }

        // Get Authorization Data from local storage
        function fillAuthData() {
            var authData = localStorageService.get('authorizationData');
            if (authData) {
                authentication.isAuth = true;
                authentication.userName = authData.userName;
                authentication.roleId = authData.roleId;
            }
        }

        function refreshToken() {
            var deferred = $q.defer();
            var authData = localStorageService.get('authorizationData');
            

            if (authData) {
                
                if (authData.useRefreshTokens) {
                    var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken
                        + "&client_id="
                        + ((provider == 'Facebook') ? config.facebookAuthClientId : ((provider == 'Google') ? config.googleAuthClientId : ''));
                    localStorageService.remove('authorizationData');

                    $http.post(accountApi.token, data, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }).success(function(response) {
                        localStorageService.set('authorizationData', {
                            token: response.access_token,
                            userName: response.userName,
                            refreshToken: response.refresh_token,
                            useRefreshTokens: true
                        });

                        deferred.resolve(response);
                    }).error(function (error, status) {
                        logout();
                        deferred.reject(error);
                    });

                    return deferred.promise;
                }
            }
        }

        //#region Open Authenticaion
        function obtainAccessToken(externalData) {
            var deferred = $q.defer();

            $http.get(accountApi.obtainAccessToken, {
                params: {
                    provider: externalData.provider,
                    externalAccessToken: externalData.externalAccessToken } 
            }).success(function (response) {
                localStorageService.set('authorizationData', {
                    token: response.access_token,
                    userName: response.userName,
                    refreshToken: "",
                    useRefreshTokens: false
                });

                authentication.isAuth = true;
                authentication.userName = response.userName;
                authentication.useRefreshTokens = false;

                deferred.resolve(response);
            }).error(function (err, status) {
                logout();
                deferred.reject(err);
            });

            return deferred.promise;
        };

        function registerExternal(registerExternalData) {
            var deferred = $q.defer();

            $http.post(accountApi.registerExternal, registerExternalData)
                .success(function (response) {
                localStorageService.set('authorizationData', {
                    token: response.access_token,
                    userName: response.userName,
                    refreshToken: "",
                    useRefreshTokens: false
                });

                authentication.isAuth = true;
                authentication.userName = response.userName;
                authentication.useRefreshTokens = false;

                deferred.resolve(response);
            }).error(function (err, status) {
                logout();
                deferred.reject(err);
            });

            return deferred.promise;
        };
        //#endregion
    }
})();
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
        ['$http', accountService]);

    function accountService($http) {

        // APIs to connect to Server
        var accountApi = {
            getUserInfo: 'api/Account/GetUserInfo',
            updateUserInfo: 'api/Account/UpdateUserInfo',
            changePassword: 'api/Account/ChangePassword',
            setPassword: 'api/Account/SetPassword',
            addLogin: 'api/Account/AddLogin',
            removeLogin: 'api/Account/RemoveLogin',

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
