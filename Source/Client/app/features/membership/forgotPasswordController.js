// 0. IIFE (Immediately-invoked function expression)
(function () {
/**
 * @description
 * 
 * Controller for register view to register local account.
 */
    'use strict';

    var controllerId = 'ForgotPasswordController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, RegisterController);

    // 2. Inject dependencies
    RegisterController.$inject = ['$stateParams', '$scope', '$window',
            'authService', 'common', 'config', 'commonConfig', 'entityManagerFactory'];

    // #region 3. Define controller
    function RegisterController($stateParams, $scope, $window,
        authService, common, config, commonConfig, emFactory) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var log = getLogFn(controllerId);
        var logWarning = getLogFn(controllerId, 'warning');
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.login = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalRegistration = null;

        vm.resetPasswordData = {
            emailAddress: ''
        }

        vm.register = registerServer;
        vm.forgotPassword = forgotPassword;
        vm.captchaValid = false;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController(controllerId)
                .then(function () { log('Activated Register View.'); });
        }

        function registerServer() {

            // Check password strength
            var passwordStrength = common.strongPasswordChecker(vm.resetPassword.password);
            if (passwordStrength == "weak" || passwordStrength == "") {
                return logWarning('Weak password, try to use a long mixed password with: ' + '<br/>' +
                    '- lower-case characters' + '<br/>' +
                    '- upper-case characters' + '<br/>' +
                    '- digits' + '<br/>' +
                    '- unique characters.');
            }
            
            // Check captcha
            if (!vm.captchaValid) return logWarning('Please enter the correct Math addition.');

            authService.register(vm.resetPassword)
                .then(success).catch(failed);

            function success() {
                log('Registration successful, redirect to login page in 2 seconds.');
                authService.startTimer('login');
            }

            function failed(response) {
                var errors = [];
                for (var key in response.data.modelState) {
                    for (var i = 0; i < response.data.modelState[key].length; i++) {
                        errors.push(response.data.modelState[key][i]);
                    }
                }
                logError('Registration failed: ' + errors.join(' '));
            }
        }

        function forgotPassword() {
            
            // Check captcha
            // if (!vm.captchaValid) return logWarning('Please enter the correct Math addition.');

            
            // TODO: authService.sendResetPasswordLink
            authService.forgotPassword(vm.resetPasswordData)
                .then(success).catch(failed);

            function success() {
                log('Instructions on resetting your password have been emailed to your email address.');
                authService.startTimer('login');
            }

            function failed(response) {
                var errors = [];
                for (var key in response.data.modelState) {
                    for (var i = 0; i < response.data.modelState[key].length; i++) {
                        errors.push(response.data.modelState[key][i]);
                    }
                }
                logError('Registration failed: ' + errors.join(' '));
            }
        }

        // TODO: AUDIT LOG - CHANGE TO ENTITY PROPERTIES
        //function cloneRegistration(registration) {
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