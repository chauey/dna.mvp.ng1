// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AdminController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, AdminController);

    // 2. Inject dependencies
    AdminController.$inject = ['$filter', '$location', '$scope',
            'authService', 'bootstrap.dialog', 'common', 'datacontext'];

    // #region 3. Define controller
    function AdminController($filter, $location, $scope,
        authService, bsDialog, common, datacontext) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.title = 'Admin';

        vm.authentication = authService.authentication;

        vm.widgetClick = widgetClick;

        // #region Error log table
        vm.errorLogs = [];
        vm.fgError;
        vm.errorGroup = '';
        vm.errorShow = false;
        // #endregion

        // #region Audit log table
        vm.auditLogs = [];
        vm.fgAudit;
        vm.auditGroup = '';
        vm.auditShow = false;
        // #endregion

        // #region Account table
        vm.accounts = [];
        vm.fgAccount;
        vm.accountGroup = '';
        vm.accountShow = false;

        vm.saveAccount = function () {
            return datacontext.save();
        };

        // remove account
        vm.removeAccount = function (index) {
            return bsDialog.deleteDialog('Account')
                .then(confirm);

            function confirm() {
                vm.accounts.splice(index, 1);
                vm.saveAccount();
            }
        };

        // add account
        vm.addAccount = function () {
            $scope.inserted = {
                userName: '',
                email: '',
                phoneNumber: ''
            };
            vm.accounts.push($scope.inserted);
        };
        // #endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            if (!vm.authentication.isAuth) {
                log('Please login to access admin view.');
                return $location.path('/login');
            }
            common.activateController([], controllerId)
                .then(function () { log('Activated Admin View.'); });
        }

        function widgetClick(name) {
            switch (name.toLowerCase()) {
                case 'error':
                {
                    if (vm.errorLogs.length == 0) { getErrorLogs(); }
                    vm.errorShow = !vm.errorShow;
                    break;
                }
                case 'account':
                {
                    if (vm.accounts.length == 0) { getAccounts(); }
                    vm.accountShow = !vm.accountShow;
                    break;
                }
                case 'role':
                {
                    log('UNDONE');
                    break;
                }
                case 'audit':
                {
                    if (vm.auditLogs.length == 0) { getAuditLogs(); }
                    vm.auditShow = !vm.auditShow;
                    break;
                }
                case 'token':
                {
                    log('UNDONE');
                    break;
                }
            }
        }

        function getErrorLogs() {
            return datacontext.admin.getAll('elmah')
                .then(function (data) {
                    vm.errorLogs = data;
                    
                    vm.fgError = new wijmo.collections.CollectionView(vm.errorLogs);
                    vm.fgError.pageSize = 20; // pagination

                    // grouping
                    $scope.$watch('vm.errorGroup', function () {
                        var cv = vm.fgError;
                        cv.groupDescriptions.clear(); // clear current groups
                        if (vm.errorGroup) {
                            var groupNames = vm.errorGroup.split(',');
                            for (var i = 0; i < groupNames.length; i++) {
                                var groupName = groupNames[i];
                                if (groupName == 'timeUtc') { // ** group dates by year
                                    var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                                        return item.timeUtc;
                                    });
                                    cv.groupDescriptions.push(groupDesc);
                                } else { // ** group everything else by value
                                    var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName);
                                    cv.groupDescriptions.push(groupDesc);
                                }
                            }
                        }
                    });
                    return data;
                }
            );
        }

        function getAccounts() {
            return datacontext.admin.getAll('account')
                .then(function (data) {
                    vm.accounts = data;
                    vm.fgAccount = new wijmo.collections.CollectionView(vm.accounts);
                    vm.fgAccount.pageSize = 20; // pagination

                    // grouping
                    $scope.$watch('vm.accountGroup', function () {
                        var cv = vm.fgAccount;
                        cv.groupDescriptions.clear(); // clear current groups
                        if (vm.accountGroup) {
                            var groupNames = vm.accountGroup.split(',');
                            for (var i = 0; i < groupNames.length; i++) {
                                var groupName = groupNames[i];
                                var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName);
                                cv.groupDescriptions.push(groupDesc);
                            }
                        }
                    });
                    return data;
                }
            );
        }

        function getAuditLogs() {
            return datacontext.admin.getAll('audit')
                .then(function (data) {
                    vm.auditLogs = data;
                    vm.auditLogs.forEach(function (log) {
                        switch (log.what.toLowerCase()) {
                            case 'u':
                                {
                                    log.what = 'Update';
                                    break;
                                }
                            case 'i':
                                {
                                    log.what = 'Insert';
                                    break;
                                }
                            case 'd':
                                {
                                    log.what = 'Delete';
                                    break;
                                }
                        }
                    })
                    vm.fgAudit = new wijmo.collections.CollectionView(vm.auditLogs);
                    vm.fgAudit.pageSize = 20; // pagination

                    // grouping
                    $scope.$watch('vm.auditGroup', function () {
                        var cv = vm.fgAudit;
                        cv.groupDescriptions.clear(); // clear current groups
                        if (vm.auditGroup) {
                            var groupNames = vm.auditGroup.split(',');
                            for (var i = 0; i < groupNames.length; i++) {
                                var groupName = groupNames[i];
                                if (groupName == 'when') { // ** group dates by year
                                    var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                                        return item.when.getFullYear();
                                    });
                                    cv.groupDescriptions.push(groupDesc);
                                } else { // ** group everything else by value
                                    var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName);
                                    cv.groupDescriptions.push(groupDesc);
                                }
                            }
                        }
                    });
                    return data;
                }
            );
        }
        // #endregion
    }
    // #endregion
})();