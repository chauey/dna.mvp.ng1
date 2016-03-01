// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'LoginController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, LoginController);

    // 2. Inject dependencies
    LoginController.$inject = ['$location', '$stateParams', '$scope', '$window',
            'authService', 'common', 'commonConfig', 'config', 'entityManagerFactory'];

    // #region 3. Define controller
    function LoginController($location, $stateParams, $scope, $window,
        authService, common, commonConfig, config, emFactory) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var log = getLogFn(controllerId);
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.login = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalLogin = null;

        vm.loginData = {
            userName: '',
            password: '',
            useRefreshTokens: false
        };

        vm.login = loginServer;
        vm.authExternalProvider = authExternalProvider;
        //vm.externalProviders = ['Facebook', 'Google', 'LinkedIn', 'Microsoft', 'Twitter', 'Yahoo'];
        vm.externalProviders = ['Facebook', 'Google'];
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4 Controller functions implementation
        function activate() {
            common.activateController(controllerId)
                .then(function () { log('Activated Login View.'); });
        }

        function loginServer() {
            authService.login(vm.loginData)
                .then(success).catch(failed);

            function success(result) {
                log('Login successful, redirect to Dashboard.');
                authService.startTimer('', true);
            }

            function failed(error) {
                logError('Login failed: ' + error.error_description);
            }
        }

        function authExternalProvider(provider) {
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

        // TODO: AUDIT LOG - CHANGE TO ENTITY PROPERTIES
        //function cloneLogin(login) {
        //    return {
        //        LoginID: login.loginID,
        //        Abbreviation: login.abbreviation,
        //        Name: login.name,
        //        Key: login.key,
        //        Order: login.order,
        //        ParentID: login.parentID,
        //        TypeID: login.typeID,
        //        Value: login.value,
        //        CreatedDate: login.createdDate,
        //        UpdatedDate: login.updatedDate,
        //        CreateBy: login.createBy,
        //        UpdateBy: login.updateBy
        //    };
        //}
        // #endregion
    }
    // #endregion
})();