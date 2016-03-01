// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'ValidationItemController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, ValidationItemController);

    // 2. Inject dependencies
    ValidationItemController.$inject = ['$location', '$stateParams', '$scope', '$window',
        'bootstrap.dialog', 'common', 'config', 'datacontext', '$rootScope', 'urlHelper'];

    // #region 3. Define controller
    function ValidationItemController($location, $stateParams, $scope, $window,
        bsDialog, common, config, datacontext, $rootScope, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.validation = undefined;
        vm.isCreating = false;

        vm.users = [];
        vm.selectedUserId = null;

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteValidation = deleteValidation;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', { get: canSave });

        //#region ui.bootstrap datepicker properties
        vm.dateFormats = ['dd-MMMM-yyyy', 'dd-MM-yyyy', 'MM-dd-yyyy', 'MMMM-dd-yyyy', 'yyyy-MM-dd',
            'shortDate', 'mediumDate', 'longDate', 'fullDate'];
        vm.datePicker = {
            minDate: '1900-01-01',
            maxDate: '2100-12-31',
            format: vm.dateFormats[6],
            dateOptions: {
                formatYear: 'yyyy',
                startingDay: 1 // 0 = Sunday, ..., 6 = Saturday
            }
        };
        $scope.clear = function () {
            vm.validation.date = null;
        };
        // Disable weekend selection
        $scope.disabled = function (date, mode) {
            //return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };
        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
        }();
        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
        $scope.openMinDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedMinDate = true;
        };
        $scope.openMaxDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.openedMaxDate = true;
        };
        //#endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedValidation()], controllerId)
   .then();
        }

        function getRequestedValidation() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.validation = datacontext.validation.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.isCreating = true;
                vm.actionType = 'I'; // For audit log
                initLookupsForRefEntity();

                return vm.validation = datacontext.validation.create();
            }

            return datacontext.validation.getById(val)
			    .then(function (data) {
			        data = data.data;
			        vm.actionType = 'U'; // For audit log
			        vm.validation = data.entity || data;

                    // Parse date
			        vm.validation.date = new moment(vm.validation.date).format('YYYY-MM-DD');
			        vm.validation.beforeDate = new moment(vm.validation.beforeDate).format('YYYY-MM-DD');
			        vm.validation.afterDate = new moment(vm.validation.afterDate).format('YYYY-MM-DD');

			        initLookupsForRefEntity();

			    }, function (error) {
			        logError('Unable to get Validation ' + val);
			        goToValidations();
			    });
        }

        function initLookupsForRefEntity() {

            datacontext.user.getAll()
               .then(function (data) {
                   vm.users = data;
                   if (vm.validation !== undefined) {
                       vm.selectedUserId = vm.validation.userId;
                   }
               });

        }

        //#region Back - Save - Cancel - Delete
        function goBack() { goToValidation(); }

        function cancel() {
            goToValidation();
        }

        function goToValidation() {
            $location.path('/validationList');
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

        function save(form) {
            if (vm.validateForm(form)) {
                vm.isSaving = true;
                vm.validation.userId = vm.selectedUserId;

                if (vm.isCreating) {

                    // Parse data
                    vm.validation.integer = parseInt(vm.validation.integer);
                    vm.validation.creditCard = parseFloat(vm.validation.creditCard);

                    return datacontext.validation.post(vm.validation)
                        .then(function(saveResult) {
                            vm.isSaving = false;
                            goBackToList();
                        }, function(error) {
                            vm.isSaving = false;
                        });
                } else {
                    return datacontext.validation.put(vm.validation.validationID, vm.validation)
                        .then(function(saveResult) {
                            vm.isSaving = false;
                            goBackToList();

                        }, function(error) {
                            vm.isSaving = false;
                        });

                }
            }
        }


        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteValidation() {
            return bsDialog.deleteDialog('Validation')
                .then(confirmDelete);

            function confirmDelete() {
                return datacontext.validation.delete(vm.validation.validationID)
                   .then(function (saveResult) {
                       goBackToList();

                   }, function (error) {
                       vm.isSaving = false;
                   });
            }
        }

        function goBackToList() {
            $location.path('/validationList');
        }

        //#endregion

        // #region AngularJS validation
        vm.regEx = {
            integer: /^$|^(\+|-)?\d+$/,
            // http://stackoverflow.com/a/9315696/3374718
            creditCard: new RegExp(
                '^(?:4[0-9]{12}(?:[0-9]{3})?' + // Visa
                '|5[1-5][0-9]{14}' + // MasterCard
                '|3[47][0-9]{13}' + // American Express
                '|3(?:0[0-5]|[68][0-9])[0-9]{11}' + // Diners Club
                '|6(?:011|5[0-9]{2})[0-9]{12}' + // Discover
                '|(?:2131|1800|35\d{3})\d{11}' + // JCB
                ')$'),
            phoneNumber: /^$|\(\d{3}\) \d{3}-\d{4}/,
            zip: /^$|^\d{5}(?:[-\s]\d{4})?$/,
            startsWithDna: /^$|DNA|dna/,
            containsDna: /^$|^(DNA|dna)/
        };

        $scope.submitted = false;
        vm.validateForm = function (form) {
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
