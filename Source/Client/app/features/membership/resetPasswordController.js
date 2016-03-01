// 0. IIFE (Immediately-invoked function expression)
(function () {
/**
 * @description
 * 
 * Controller for register view to register local account.
 */
    'use strict';

    var controllerId = 'ResetPasswordController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, RegisterController);

    // 2. Inject dependencies
    RegisterController.$inject = ['$stateParams', '$scope', '$window',
            'authService', 'common', 'config', 'commonConfig', 'entityManagerFactory', 'accountService'];

    // #region 3. Define controller
    function RegisterController($stateParams, $scope, $window,
        authService, common, config, commonConfig, emFactory, accountService) {
        // #region 3.1. Define functions
        var stateParams = $stateParams;
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

        vm.oldPassword = '';
        vm.newPassword = '';
        vm.confirmPassword = '';
        vm.resetPassword = resetPassword;
        vm.cancelResetPassword = cancelResetPassword;

        Object.defineProperty(vm, 'canResetPassword', {
            get: canResetPassword
        });
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onHasChanges();
            common.activateController(controllerId)
                .then(function () { log('Activated Register View.'); });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function canResetPassword() {
            if (vm.newPassword == null || vm.newPassword == undefined || vm.newPassword.length == 0
                || vm.confirmPassword == null || vm.confirmPassword == undefined || vm.confirmPassword.length == 0) {
                return false;
            }
            else {
                //// Check password strength
                //var passwordStrength = common.strongPasswordChecker(vm.newPassword);
                //if (passwordStrength == "weak" || passwordStrength == "") {
                //    logError('Weak password, try to use a long mixed password with: ' + '<br/>' +
                //        '- lower-case characters' + '<br/>' +
                //        '- upper-case characters' + '<br/>' +
                //        '- digits' + '<br/>' +
                //        '- unique characters.');
                //    return false;
                //}
                //else
                if (vm.newPassword === vm.confirmPassword && vm.oldPassword !== vm.newPassword) {
                    return true;
                }
            }

            return false;
        }

        function resetPassword() {
            // Revert Token string
            // var token = stateParams.token.replace(/=DNA=/g, "/");
            accountService.resetPassword({
                userId: stateParams.userId,
                resetPasswordToken: stateParams.token,
                newPassword: vm.confirmPassword
            }).then(_updateSuccess).catch(_updateFailed);
        }

        function _updateSuccess(response) {
            cancelResetPassword();
            logSuccess('Update success.');
        }

        function _updateFailed(response) {
            cancelResetPassword()
            logError('Update failed: ' + response.statusText + '.');
        }

        function cancelResetPassword() {
            vm.oldPassword = vm.newPassword = vm.confirmPassword = '';
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