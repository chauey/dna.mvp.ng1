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
            'config', 'localStorageService', 'zStorage', 'aclService', '$rootScope', authService]);

    function authService($http, $location, $q, $timeout,
        config, localStorageService, zStorage, aclService, $rootScope) {

        var _baseUrl = config.remoteServiceName;
        var _baseApiUrl = _baseUrl + "api/Account/";

        var authentication = {
            isAuth: false,
            userName: "",
            useRefreshTokens: false,
            roleId: 0
        };

        var accountApi = {
            token: config.remoteServiceName + 'Token',
            register: config.remoteServiceName + 'api/Account/Register',
            login: config.remoteServiceName + 'api/Account/Login',
            obtainAccessToken: config.remoteServiceName + 'api/Account/ObtainLocalAccessToken',
            registerExternal: config.remoteServiceName + 'api/Account/RegisterExternal',
            forgotPassword: _baseApiUrl + 'ForgotPassword'
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
            forgotPassword: forgotPassword,

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

        function forgotPassword(forgotPassword) {
            // logout();
            debugger;
            return $http.post(accountApi.forgotPassword, forgotPassword).then(function (response) {
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
                aclService.getAllAccessControlListAndPermissions('name').then(function (result) {
                    authentication.accessControlList = result.accessControlList;
                    authentication.domainObjectList = [];
                    for (var i = 0; i < authentication.accessControlList.length; i++) {
                        authentication.domainObjectList.push(authentication.accessControlList[i].domainObject.description);
                    }

                    $rootScope.currentUser = authentication;
                });
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
                    }).success(function (response) {
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
                    externalAccessToken: externalData.externalAccessToken
                }
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