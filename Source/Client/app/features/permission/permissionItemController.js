// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'permissionItemController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, PermissionItemController);

    // 2. Inject dependencies
    PermissionItemController.$inject = ['$location', '$stateParams', '$scope', '$window',
       'bootstrap.dialog', 'common', 'config', 'datacontext', '$rootScope', 'urlHelper'];
    // #region 3. Define controller
    function PermissionItemController($location, $stateParams, $scope, $window,
        bsDialog, common, config, datacontext, $rootScope, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.permission = undefined;
	vm.isCreating = false;


        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deletePermission = deletePermission;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedPermission()], controllerId)
    .then();
        }

        function getRequestedPermission() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.permission = datacontext.permission.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                //initLookupsForRefEntity();

                return vm.permission = datacontext.permission.create();
            }

            return datacontext.permission.getById(val)
			    .then(function (data) {
			        data = data.data;
			        vm.actionType = 'U'; // For audit log
			        vm.permission = data.entity || data;
			        //initLookupsForRefEntity();

			    }, function (error) {
			        logError('Unable to get Permission ' + val);
			        goToPermission();
			    });
        }

        function initLookupsForRefEntity() {

            datacontext.user.getAll()
               .then(function (data) {
                   vm.users = data;
                   if (vm.permission !== undefined) {
                       vm.selectedUserId = vm.permission.userId;
                   }
               });

        }

        //#region Back - Save - Cancel - Delete
        function goBack() { goToPermission(); }

        function cancel() {
            goToPermission();
        }

        function goToPermission() {
            $location.path('/permissionList');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                datacontext.cancel();
            });
        }

        function canSave() {
            // TODO: Watch on Angular Binding for triggering Save button
            //return ($rootScope.canSave && vm.hasChanges && !vm.isSaving);
            return true;
        }

        function save() {
//            if (vm.submit(form)) {
                vm.isSaving = true;
                vm.permission.userId = vm.selectedUserId;
                if (vm.isCreating) {
                    return datacontext.permission.post(vm.permission)
                        .then(function(saveResult) {
                            vm.isSaving = false;
                            goBackToList();
                        }, function(error) {
                            vm.isSaving = false;
                        });
                } else {
                    return datacontext.permission.put(vm.permission.id, vm.permission)
                        .then(function(saveResult) {
                            vm.isSaving = false;
                       goBackToList();

                        }, function(error) {
                            vm.isSaving = false;
                        });

                }
//            }
        }


        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deletePermission() {
            return bsDialog.deleteDialog('Permission')
                .then(confirmDelete);

            function confirmDelete() {
                return datacontext.permission.delete(vm.permission.id)
                   .then(function (saveResult) {
                       goBackToList();

                   }, function (error) {
                       vm.isSaving = false;
                   });
            }
        }

        function goBackToList() {
            $location.path('/permissionList');
        }

        //#endregion

        // #region AngularJS validation
        vm.integerRegEx = /^$|^(\+|-)?\d+$/;
        // Visa, MasterCard, American Express, Diners Club, Discover, and JCB RegEx: http://stackoverflow.com/a/9315696/3374718
        vm.creditCardRegEx = /^$|^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        vm.phoneNumberRegex = /^$|\(\d{3}\) \d{3}-\d{4}/;
        vm.zipRegex = /^$|^\d{5}(?:[-\s]\d{4})?$/;
        vm.startsWithDnaRegex = /^$|DNA|dna/;
        vm.containsDnaRegex = /^$|^(DNA|dna)/;

        $scope.submitted = false;

        vm.submit = function (form) {
            $scope.submitted = true;
            if (form.$valid) {
                console.log('Form is valid');
                log("Form is valid.");
                return true;
            }
            logError("Form is not valid.");
            return false;
        }

        vm.interacted = function (field) {
            return $scope.submitted || field.$dirty;
        }
        // #endregion
        // #endregion
    }
    // #endregion
})();

