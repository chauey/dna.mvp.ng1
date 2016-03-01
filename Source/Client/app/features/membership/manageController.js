// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'ManageController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, ManageController);

    // 2. Inject dependencies
    ManageController.$inject = ['$http', '$location', '$state', '$scope',
            'accountService', 'authService', 'bootstrap.dialog', 'common', 'config', 'entityManagerFactory'];

    // #region 3. Define controller
    function ManageController($http, $location, $state, $scope,
        accountService, authService, bsDialog, common, config, emFactory) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var logWarning = getLogFn(controllerId, 'warning');
        var log = getLogFn(controllerId);
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.authentication = authService.authentication;
        vm.tokenRefreshed = false;
        vm.tokenResponse = null;
        vm.refreshToken = refreshToken;

        vm.account = {
            userName: '',
            id: '',
            email: '',
            phoneNumber: ''
        };
        vm.upateUserInfo = upateUserInfo;

        vm.hasLocalPassword = false;
        vm.passwordSection = 'Create Local Account';
        vm.password = {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        };
        vm.changePassword = changePassword;

        vm.logins = [];
        //vm.externalProviders = ['Facebook', 'Google', 'LinkedIn', 'Microsoft', 'Twitter', 'Yahoo'];
        vm.externalProviders = ['Facebook', 'Google'];
        vm.addLogin = addLogin;
        vm.removeLogin = removeLogin;

        vm.activate = activate;
        // #endregion

        // 3.3 Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            if (!vm.authentication.isAuth) { return $location.path('/login'); }
            common.activateController([getUserInfo()], controllerId)
                .then(function () { log('Activated Manage Account View.'); });
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
            }

            function failed(response) {
                logError('Retrieved user information failed: ' + response.message + '.');
            }
        }

        function upateUserInfo() {
            accountService.updateUserInfo(vm.account)
                .then(_updateSuccess).catch(_updateFailed);
        }

        function changePassword() {
            // Check password strength
            var passwordStrength = common.strongPasswordChecker(vm.password.newPassword);
            if (passwordStrength == "weak" || passwordStrength == "") {
                return log('Weak password, try to use a long mixed password with: ' + '<br/>' +
                    '- lower-case characters' + '<br/>' +
                    '- upper-case characters' + '<br/>' +
                    '- digits' + '<br/>' +
                    '- unique characters.');
            }

            if (vm.hasLocalPassword) {
                accountService.changePassword(vm.password)
                    .then(_updateSuccess).catch(_updateFailed);
            } else {
                accountService.setPassword(vm.password)
                    .then(_updateSuccess).then(_refreshLogins).catch(_updateFailed);
            }
        }

        //#region add external login
        function addLogin(provider) {
            var serviceRoot = emFactory.serviceRoot;
            var redirectUri = serviceRoot + 'app/features/membership/authComplete.html';

            var externalProviderUrl = serviceRoot + "api/Account/ExternalLogin?provider=" + provider
                + "&response_type=token&client_id="
                + ((provider == 'Facebook') ? config.facebookAuthClientId : ((provider == 'Google') ? config.googleAuthClientId : ''))
                + "&redirect_uri=" + redirectUri;

            window.$windowScope = $scope;
            window.open(externalProviderUrl, "Authenticate Account", "location=0,status=0,width=600,height=750");
        }

        $scope.authCompletedCB = function (fragment) {
            $scope.$apply(function () {
                if (fragment.haslocalaccount == 'False') {
                    authService.logout();

                    authService.externalAuthData = {
                        provider: fragment.provider,
                        userName: fragment.external_user_name,
                        externalAccessToken: fragment.external_access_token
                    };

                    $location.path('/associate');
                }
                else {
                    // Obtain access token and redirect to Dashboard
                    var externalData = { provider: fragment.provider, externalAccessToken: fragment.external_access_token };
                    authService.obtainAccessToken(externalData).then(function (response) {
                        $location.path('/');
                    },
                 function (err) {
                     $scope.message = err.error_description;
                 });
                }
            });
        }
        //#endregion

        function removeLogin(loginData) {
            return bsDialog.confirmationDialog('Remove Login', 'Do you want to remove Login?', 'Yes', 'No')
                .then(confirm);

            function confirm() {
                if (vm.logins.length == 1) {
                    return logWarning('You must have have at least 1 login.');
                }
                var removePasswordModel = {
                    loginProvider: loginData.loginProvider,
                    providerKey: loginData.providerKey
                }
                accountService.removeLogin(removePasswordModel)
                    .then(_updateSuccess).then(_refreshLogins).catch(_updateFailed);
            }
        }

        function refreshToken() {
            authService.refreshToken().then(function (response) {
                vm.tokenRefreshed = true;
                vm.tokenResponse = response;
            },
            function(error) {
                $location.path('/login');
            });
        }

        function _updateSuccess(response) {
            log('Update success.');
        }

        function _refreshLogins() {
            vm.logins = [];
            getUserInfo();
            $state.reload();
        }

        function _updateFailed(response) {
            logError('Update failed: ' + response.statusText + '.');
        }
        // #endregion
    }
    // #endregion
})();
