// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'DashboardController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, DashboardController);

    // 2. Inject dependencies
    DashboardController.$inject = ['$scope', '$http', '$timeout',
        'common', 'datacontext'];

    // #region 3. Define controller
    function DashboardController($scope, $http, $timeout,
        common, datacontext) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.typeOfTypeCount = 0;
        // #endregion

        // 3.3. Run activate method

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            activate();
        });

        // #region 3.4. Controller functions implementation
        function activate() {
            var promises = [getTypeOfTypeCount()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View.'); });
        }

        function getTypeOfTypeCount() {
            return datacontext.typeOfType.getCount().then(function (data) {
                return vm.typeOfTypeCount = data;
            });
        }
        // #endregion
    }
    // #endregion
})();
// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'typeOfTypeListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, TypeOfTypeListController);

	// 2. Inject dependencies
	TypeOfTypeListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function TypeOfTypeListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.typeOfTypes = [];
		vm.typeOfTypeCount = 0;
		vm.typeOfTypeFilteredCount = 0;
		vm.typeOfTypeSearch = '';

		vm.title = 'TypeOfTypes';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToTypeOfType = goToTypeOfType;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.typeOfTypeFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Abbreviation','Name','Key','Order','Value']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.typeOfTypesServer = [];
        vm.typeOfTypesServerFilter = [];
        vm.typeOfTypeCountServer = 0;
        vm.typeOfTypeFilteredCountServer = 0;
        vm.typeOfTypeServerSearch = '';
        vm.setTypeOfTypesServerFilter = setTypeOfTypesServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.typeOfTypeFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'name',
			orderDesc: ''
		};

       // fields for relative entities 

        vm.selectedParent = null;
        vm.selectedParentServer = null;
           vm.selectedType = null;
        vm.selectedTypeServer = null;
         
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getTypeOfTypes() 
                                       ,getTypeOfTypesServer()
    ,getParents()
       ,getTypes()
   
], controllerId)
				.then(function () { 
                    log('Activated TypeOfTypes View.');

                    // init data-table
                    TableAdvanced.init();
                    TableAdvanced.initServer();
                     });
		}

  function getParents() {
            //return datacontext.parent.getAllWithoutPaging().then(function (data) {
            //    vm.parents = data;
            //});
        }
     function getTypes() {
            //return datacontext.type.getAllWithoutPaging().then(function (data) {
            //    vm.types = data;
            //});
        }
   
		function getTypeOfTypes(forceRefresh) {
			return datacontext.typeOfType.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.typeOfTypeSearch)
				.then(function (data) {
					vm.typeOfTypes = data;
                    vm.typeOfTypesServerFilter = data;
					
                    if (!vm.typeOfTypeCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getTypeOfTypeCount();
					}
					getTypeOfTypeFilteredCount();
					return data;
				}
			);
		}

		function getTypeOfTypesServer(forceRefresh) {
            return datacontext.typeOfType.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.typeOfTypeServerSearch)
                .then(function(data) {
                    vm.typeOfTypesServerFilter = data;

                    if (!vm.typeOfTypeFilteredCountServer || forceRefresh) {
                        getTypeOfTypeCountServer();
                    }

                    getTypeOfTypeFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getTypeOfTypeCount() {
			return datacontext.typeOfType.getCount().then(function (data) {
				return vm.typeOfTypeCount = data;
			});
		}

		function getTypeOfTypeFilteredCount() {
            vm.typeOfTypeFilteredCount = datacontext.typeOfType.getFilteredCount(vm.typeOfTypeSearch);
		}

		function getTypeOfTypeCountServer() {
            return datacontext.typeOfType.getCount().then(function (data) {
                return vm.typeOfTypeCountServer = data;
            });
        }

        function getTypeOfTypeFilteredCountServer() {
            datacontext.typeOfType.getFilteredCountServer(vm.typeOfTypeServerSearch)
                .then(function(count) {
                    vm.typeOfTypeFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getTypeOfTypes();
		}

		function pageChangedServer() {
            getTypeOfTypesServer();
        }

		function refresh() { getTypeOfTypes(true); }
		function refreshServer() { getTypeOfTypesServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.typeOfTypeSearch = ''; }
			getTypeOfTypes();
		}

		function searchServer() {
            return getTypeOfTypesServer();
        }

        function setTypeOfTypesServerFilter(typeOfType) {
            var textContains = common.textContains;
            var searchText = vm.typeOfTypesServerSearch;

            var isMatch = searchText
                ? textContains(typeOfType.name, searchText)
                || textContains(typeOfType.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getTypeOfTypes();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getTypeOfTypesServer();
        }
		// #endregion

		function goToTypeOfType(typeOfType) {
			if (typeOfType && typeOfType.typeOfTypeID) {
				$location.path('/typeOfType/' + typeOfType.typeOfTypeID);
			}
		}

  // #region Relative entities


        vm.onParentSelectionChange = function () {
            // get all TypeOfTypes (from local) by ParentID.
            if (vm.selectedParent != null) {
                datacontext.typeOfType.getAllByParentID(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedParent.parentID)
                .then(function (results) {
                    vm.typeOfTypes = results;
                    vm.typeOfTypeFilteredCount = results.length;
                });
            }
            else {
                getTypeOfTypes(false);
            }
        }

        vm.onParentServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedParentServer != null) {
                datacontext.typeOfType.getAllByParentID(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedParentServer.cptCodeVersionID)
                .then(function (results) {
                    vm.typeOfTypesServerFilter = results;
                    vm.typeOfTypeFilteredCountServer = results.length;
                });
            }
            else {
                getTypeOfTypesServer(true);
            }
        }
   
        vm.onTypeSelectionChange = function () {
            // get all TypeOfTypes (from local) by TypeID.
            if (vm.selectedType != null) {
                datacontext.typeOfType.getAllByTypeID(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedType.typeID)
                .then(function (results) {
                    vm.typeOfTypes = results;
                    vm.typeOfTypeFilteredCount = results.length;
                });
            }
            else {
                getTypeOfTypes(false);
            }
        }

        vm.onTypeServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedTypeServer != null) {
                datacontext.typeOfType.getAllByTypeID(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedTypeServer.cptCodeVersionID)
                .then(function (results) {
                    vm.typeOfTypesServerFilter = results;
                    vm.typeOfTypeFilteredCountServer = results.length;
                });
            }
            else {
                getTypeOfTypesServer(true);
            }
        }
           // #endregion




		// #endregion
	}
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'TypeOfTypeItemController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, TypeOfTypeItemController);

    // 2. Inject dependencies
    TypeOfTypeItemController.$inject = ['$location', '$stateParams', '$scope', '$window',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'model', 'datacontext', 'urlHelper'];

    // #region 3. Define controller
    function TypeOfTypeItemController($location, $stateParams, $scope, $window,
        bsDialog, common, config, commonConfig, model, datacontext, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.typeOfType;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.typeOfType = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalTypeOfType = null;

        vm.parentTypeOfTypes = [];
        vm.types = [];

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteTypeOfType = deleteTypeOfType;
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
            initLookups();
            common.activateController([getRequestedTypeOfType()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedTypeOfType() {
            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.typeOfType = datacontext.typeOfType.create();
            }

            return datacontext.typeOfType.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalTypeOfType = cloneTypeOfType(data);              
                    
                    // If get data from WIP, need to use data.entity, otherwise use data.
                    wipEntityKey = data.key;
                    vm.typeOfType = data.entity || data;
                }, function (error) {
                    logError('Unable to get Type Of Type ' + val);
                    goToTypeOfTypes();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() { $window.history.back(); }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            urlHelper.replaceLocationUrlGuidWithId(vm.typeOfType.typeOfTypeID);
            if (vm.typeOfType.entityAspect.entityState.isDetached()) {
                goToTypeOfTypes();
            }
        }

        function goToTypeOfTypes() {
            $location.path('/typeOfTypeList');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;

            // Save Changes
            return datacontext.save("SaveTypeOfTypes")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.typeOfType,
                                        vm.actionType != 'D' ? vm.originalTypeOfType : cloneTypeOfType(vm.typeOfType),
                                        vm.actionType != 'D' ? cloneTypeOfType(vm.typeOfType) : null);

                    removeWipEntity();
                    urlHelper.replaceLocationUrlGuidWithId(vm.typeOfType.typeOfTypeID);
                }, function (error) {
                    vm.isSaving = false;
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteTypeOfType() {
            return bsDialog.deleteDialog('Type Of Type')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.typeOfType);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    goToTypeOfTypes();
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;

            vm.parentTypeOfTypes = lookups.parentTypeOfTypes;
            vm.types = lookups.types;
        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.typeOfType) { return; }
            var description = vm.typeOfType.name || '[New TypeOfType] id: ' + vm.typeOfType.typeOfTypeID;

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.typeOfType, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) {
                    autoStoreWip();
                }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function cloneTypeOfType(typeOfType) {
            return {
                TypeOfTypeID: typeOfType.typeOfTypeID,
                Abbreviation: typeOfType.abbreviation,
                Name: typeOfType.name,
                Key: typeOfType.key,
                Order: typeOfType.order,
                ParentID: typeOfType.parentID,
                TypeID: typeOfType.typeID,
                Value: typeOfType.value,
                CreatedDate: typeOfType.createdDate,
                UpdatedDate: typeOfType.updatedDate,
                CreateBy: typeOfType.createBy,
                UpdateBy: typeOfType.updateBy
            };
        }
        // #endregion
    }
    // #endregion
})();

// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'ValidationListController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, ValidationListController);

    // 2. Inject dependencies
    ValidationListController.$inject = ['$location', 'common', 'config', 'entityManagerFactory'];

    // #region 3. Define controller
    function ValidationListController($location, common, config, emFactory) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;
        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        //#region Client-side cached data
        vm.validationsSearch = '';
        vm.validations = [];
        vm.filteredValidations = [];
        var applyFilter = function () { };
        vm.validationsFilter = validationsFilter;
        vm.search = search;

        vm.refresh = refresh;
        vm.title = 'Validations';
        vm.goToValidation = goToValidation;

        //vm.theads = ['Integer', 'String', 'Date', 'Before Date', "After Date", 'Age', 'Credit Card', 'Email', 'Phone', 'URL', 'Zip', 'Starts With "DPT"', 'Contains "DPT"'];
        vm.theads = ['Integer', 'String', 'Age', 'Email', 'Phone'];
        vm.setSort = setSort;
        vm.sorting = {
            orderBy: 'integer',
            orderDesc: false
        };
        //#endregion

        //#region Server-side remote access
        vm.validationsSearchServer = '';
        vm.validationsServer = [];
        vm.filteredvalidationsserver = [];
        var applyFilterServer = function () { };
        vm.validationsFilter = validationsFilter;
        vm.searchServer = searchServer;
        vm.refreshServer = refreshServer;

        vm.imageSource = './Content/images/angularjs.png';
        //#endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getValidations(), getValidationsServer()], controllerId)
                .then(function () {

                    // createSearchThrottle uses values by convention, via its parameters:
                    //     vm.validationsSearch is where the user enters the search 
                    //     vm.validations is the original unfiltered array
                    //     vm.filteredValidations is the filtered array
                    //     vm.validationsFilter is the filtering function
                    applyFilter = common.createSearchThrottle(vm, "validations");
                    if (vm.validationsSearch) { applyFilter(true); }
                 log('Activated Validations View.');
            });
        }

        function getValidations() {
            return breeze.EntityQuery.from('Validations')
                .using(emFactory.newManager()).execute()
                .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                vm.validations = vm.filteredValidations = data.results;
                log('Retrieved [Validations] from remote data source.', data.results.length, true);
                return data;
            }
        }

        function getValidationsServer(predicate) {
            return breeze.EntityQuery.from('Validations')
                    .where(predicate)
                    .using(emFactory.newManager()).execute()
                    .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
                vm.validationsServer = vm.filteredvalidationsserver = data.results;
                log('Retrieved [Validations] from remote data source.', data.results.length, true);
                return data;
            }
        }

        function goToValidation(validation) {
            if (validation && validation.validationID) {
                $location.path('/validation/' + validation.validationID);
            }
        }

        function refresh() { getValidations(); }

        function refreshServer() { getValidationsServer(); }

        function setSort(prop) {
            prop = prop.replace(/ /g, '');                                      // Replace whitespaces
            prop = prop.replace(/"/g, '');                                      // Replace doublequotes
            vm.sorting.orderBy = prop.charAt(0).toLowerCase() + prop.slice(1);  // Lowercase first letter
            vm.sorting.orderDesc = !vm.sorting.orderDesc;
        }

        // #region search
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.validationsSearch = '';
                applyFilter(true);
            } else {
                applyFilter();
            }
        }

        function validationsFilter(validation) {
            var textContains = common.textContains;
            var searchText = vm.validationsSearch;

            var formatedDate = validation.date,
                formatedBeforeDate = validation.beforeDate,
                formatedAfterDate = validation.afterDate;

            // format Javascript Date object to mm/dd/yyyy
            formatedDate = common.formatDate(formatedDate);
            formatedBeforeDate = common.formatDate(formatedBeforeDate);
            formatedAfterDate = common.formatDate(formatedAfterDate);

            // search for each fields
            var isMatch = searchText
                ? textContains(validation.integer, searchText)
                || textContains(validation.string, searchText)
                || textContains(formatedDate, searchText)
                || textContains(formatedBeforeDate, searchText)
                || textContains(formatedAfterDate, searchText)
                || textContains(validation.age, searchText)
                || textContains(validation.email, searchText)
                || textContains(validation.phone, searchText)
                || textContains(validation.uRL, searchText)
                || textContains(validation.zip, searchText)
                || textContains(validation.startsWithDPT, searchText)
                || textContains(validation.containsDPT, searchText)
                : true;
            return isMatch;
        }

        //UNDONE: search with many datatypes (convert Breeze datatype to string)
        function searchServer() {
            log('undone');
            //http://stackoverflow.com/questions/25882600/breezejs-predicate-how-to-search-for-multiple-data-types
            //    var query = breeze.EntityQuery.from("Validations");
            //    var searchText = vm.validationsSearchServer;

            //    var p1 = new Predicate("Email", "contains", searchText);
            //    var p2 = new Predicate("Phone", "contains", searchText);
            //    var p3 = new Predicate("Zip", "contains", searchText);
            //    query.where(Predicate.or[p1, p2, p3]).using(emFactory.newManager()).execute()
            //    .then(querySucceeded).catch(self._queryFailed);

            //    function querySucceeded(data) {
            //        
            //        vm.validationsServer = vm.filteredvalidationsserver = data.results;
            //        log('Retrieved [Validations] from remote data source.', data.results.length, true);
            //        return data;
            //    }

            //    //var searchDate = new Date(2014, 0, 1);
            //    //var p1 = new Predicate("BeforeDate", "==", searchDate);
            //    //var p2 = new Predicate("AfterDate", "==", searchDate);
            //    //query.where(Predicate.or[p1, p2]);

            //    //var searchYear = 2014;
            //    //// Predicate.create works as well
            //    //var p1 = new Predicate("year(BeforeDate)", "==", searchYear);
            //    //var p2 = new Predicate("year(AfterDate)", "==", searchYear);
            //    //query.where(Predicate.or[p1, p2]);

            //    //var searchDate = new Date(2014, 0, 1);
            //    //var searchText = searchDate.toString();

            //    //// Predicate.create works as well
            //    //var p1 = new Predicate("Email", "contains", searchText);
            //    //var p2 = new Predicate("BeforeDate", "==", searchDate);
            //    //query.where(Predicate.or[p1, p2]);

            //    ////var numericPredicate, stringPredicate, predicate;
            //    ////if (vm.validationsSearchServer) {
            //    ////    //numericPredicate = numericPredicateFn(vm.validationsSearchServer);
            //    ////    stringPredicate = stringPredicateFn(vm.validationsSearchServer);
            //    ////    predicate = Predicate.or(stringPredicate); 
            //    ////}

            //    //var pred = Predicate.create('age', '==', vm.validationsSearchServer)
            //    //    .or('integer', '==', vm.validationsSearchServer)
            //    //    //.or('creditCard', '==', vm.validationsSearchServer)
            //    //    .or('phone', 'contains', vm.validationsSearchServer)
            //    //    //.or('email', 'contains', vm.validationsSearchServer)
            //    //    //.or('string', '==', vm.validationsSearchServer)
            //    //;
            //    //return breeze.EntityQuery.from('Validations')
            //    //        .where(pred)
            //    //        .using(emFactory.newManager()).execute()
            //    //        .then(querySucceeded).catch(self._queryFailed);

            //    //function querySucceeded(data) {
            //    //    
            //    //    vm.validationsServer = vm.filteredvalidationsserver = data.results;
            //    //    log('Retrieved [Validations] from remote data source.', data.results.length, true);
            //    //    return data;
            //    //}

            //    ////getValidationsServer(predicate);
            //}

            //function numericPredicateFn(filterValue) {
            //    return Predicate.create('age', '==', filterValue)
            //        .or('integer', '==', filterValue)
            //        .or('creditCard', '==', filterValue)
            //    ; // Exceed Edm.Int32 range ex: 123451234512345
            //    //.or('date', '==', new Date(Date.UTC(filterValue)));
            //    //.or('beforeDate', '==', filterValue)
            //    //.or('afterDate', '==', filterValue);
            //}

            //function stringPredicateFn(filterValue) {
            //    return Predicate.create('string'.toString(), 'contains', filterValue)
            //        .or('email', 'contains', filterValue)
            //        .or('phone', 'contains', filterValue)
            //        .or('uRL', 'contains', filterValue)
            //        .or('zip', 'contains', filterValue)
            //        .or('startsWithDPT', 'contains', filterValue)
            //        .or('containsDPT', 'contains', filterValue);

            // #endregion
        }
        // #endregion
    }
    // #endregion
})();

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
        'bootstrap.dialog', 'common', 'config', 'datacontext', '$rootScope'];

    // #region 3. Define controller
    function ValidationItemController($location, $stateParams, $scope, $window,
        bsDialog, common, config, datacontext, $rootScope) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.validation = undefined;
        vm.validationNG = undefined;

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
            common.activateController([getRequestedValidation(), getRequestedValidationNG()], controllerId);
        }

        function getRequestedValidation() {
            var val = $stateParams.id;

            if (val === 'new') {
                vm.validation = datacontext.typeOfType.create_Validation();
                return vm.validation;
            }

            return datacontext.typeOfType.getById_Validation(val)
                .then(function (data) {
                    vm.validation = data;
                }, function (error) {
                    logError('Unable to get Validation ' + val);
                });
        }

        function getRequestedValidationNG() {
            var val = $stateParams.id;

            if (val === 'new') {
                return vm.validationNG; // empty object
            }

            return datacontext.typeOfType.getById_ValidationNG(val)
                .then(function (data) {
                    vm.validationNG = data[0];

                    // Format date data format to HTML5 input date format using Moment
                    vm.validationNG.Date = moment(vm.validationNG.Date).format('YYYY-MM-DD');
                    vm.validationNG.BeforeDate = moment(vm.validationNG.BeforeDate).format('YYYY-MM-DD');
                    vm.validationNG.AfterDate = moment(vm.validationNG.AfterDate).format('YYYY-MM-DD');
                }, function (error) {
                    logError('Unable to get Validation ' + val);
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() { $window.history.back(); }

        function cancel() {
            datacontext.cancel();

            if (vm.validation.entityAspect.entityState.isDetached()) {
                goToValidation();
            }
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
            return ($rootScope.canSave && vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
            return datacontext.save("SaveValidations")
                .then(function (saveResult) {
                    vm.isSaving = false;
                }, function (error) {
                    vm.isSaving = false;
                });
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
                datacontext.markDeleted(vm.validation);
                vm.save().then(success).catch(failed);

                function success() { goToValidation(); }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

        // #region AngularJS validation
        // Visa, MasterCard, American Express, Diners Club, Discover, and JCB RegEx: http://stackoverflow.com/a/9315696/3374718
        vm.integerRegEx = /^(\+|-)?\d+$/;
        vm.creditCardRegEx = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;
        vm.phoneNumberRegex = /\(\d{3}\) \d{3}-\d{4}/;
        vm.zipRegex = /^\d{5}(?:[-\s]\d{4})?$/;
        vm.startsWithDnaRegex = /DNA|dna/;
        vm.containsDnaRegex = /^(DNA|dna)/;

        $scope.submitted = false;

        vm.submit = function (form) {
            $scope.submitted = true;
            if (form.$valid) return log("Form is valid.");
            return logError("Form is not valid.");
        }

        vm.interacted = function (field) {
            return $scope.submitted || field.$dirty;
        }
        // #endregion
        // #endregion
    }
    // #endregion
})();

// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'AllDataTypeListController';

    // 1. Get 'app' module and define controller
	angular.module('app.features').controller(controllerId, AllDataTypeListController);

    // 2. Inject dependencies
    AllDataTypeListController.$inject = ['$location', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
	function AllDataTypeListController($location, common, config, datacontext) {

	    // #region 3.1. Define functions
	    var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
	    // #endregion

	    // #region 3.2. Define bindable variables to the view
		vm.allDataTypes = [];
		vm.allDataTypeCount = 0;
		vm.allDataTypeFilteredCount = 0;
		vm.allDataTypeSearch = '';

		vm.title = 'AllDataTypes';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAllDataType = goToAllDataType;

		vm.paging = {
			currentPage: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.allDataTypeFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['BigInt','Binary','Bit','Char','Date','DateTime','DateTime2','DateTimeOffset','Decimal','Float','Geography','Geometry','Image','Int','Money','NChar','NText','Numeric','NVarChar','NVarCharMax','Real','SmallDateTime','SmallInt','SmallMoney','Text','Time','TimeStamp','TinyInt','UniqueIdentifier','VarBinary','VarBinaryMax','VarChar','VarCharMax','Xml','ZSql_Variant']; // TODO: DONE - ADD TABLE HEADERS HERE
		vm.sorting = {
			orderBy: 'bigInt',
			orderDesc: ''
		};
	    // #endregion

	    // 3.3. Run activate method
		activate();

	    // #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getAllDataTypes()], controllerId)
				.then(function () { log('Activated AllDataTypes View.'); });
		}

		function getAllDataTypes(forceRefresh) {
			return datacontext.allDataType.getAll(forceRefresh, vm.sorting.orderBy, vm.sorting.orderDesc,
				vm.paging.currentPage, vm.paging.pageSize, vm.allDataTypeSearch)
				.then(function (data) {

					vm.allDataTypes = data;
					if (!vm.allDataTypeCount || forceRefresh) {
						getAllDataTypeCount();
					}
					getAllDataTypeFilteredCount();
					return data;
				}
			);
		}

		//#region Get Counts
		function getAllDataTypeCount() {
			return datacontext.allDataType.getCount().then(function (data) {
				return vm.allDataTypeCount = data;
			});
		}

		function getAllDataTypeFilteredCount() {
			vm.allDataTypeFilteredCount = datacontext.allDataType.getFilteredCount(vm.allDataTypeSearch);
		}
		//#endregion

		//#region Paging/Sorting/Filtering
		function pageChanged(page) {
			if (!page) { return; }
			vm.paging.currentPage = page;
			getAllDataTypes();
		}

		function refresh() { getAllDataTypes(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.allDataTypeSearch = ''; }
			getAllDataTypes();
		}

		function setSort(prop) {
			// Process orderBy and orderDesc
			prop = prop.replace(/ /g, '');
			vm.sorting.orderBy = prop.charAt(0).toLowerCase() + prop.slice(1);
			if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
			else { vm.sorting.orderDesc = ''; }

			// Check if Local inline count =< server inline count
			var serverInlineCount, forceRemote = true;
			datacontext.allDataType.getCount(forceRemote).then(function (data) {
				serverInlineCount = data;
				if (vm.allDataTypeCount <= serverInlineCount) {
					// Sort locally
					getAllDataTypes().then(function (data) { return vm.allDataTypes = data; });
				} else {
					// Go remotely
					getAllDataTypes(forceRemote).then(function (data) { return vm.allDataTypes = data; });
				}
			});
		}
		//#endregion

		function goToAllDataType(allDataType) {
			if (allDataType && allDataType.allDataTypeID) {
				$location.path('/allDataType/' + allDataType.allDataTypeID);
			}
		}
	    // #endregion
	}
    // #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AllDataTypeItemController';

	// 1. Add controller to module
    angular
		.module('app.features')
		.controller(controllerId, AllDataTypeItemController);

	// 2. Inject dependencies
	AllDataTypeItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// 3. Define controller
    function AllDataTypeItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Setup variables and functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.allDataType;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Expose public bindable interface
		vm.activate = activate;
        vm.allDataType = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAllDataType = null;

					vm.zHierarchys = [];
            vm.selectedZHierarchy =  null;
			$scope.$watch('vm.selectedZHierarchy', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            vm.hasChanges = true;
        });
      
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAllDataType = deleteAllDataType;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

		// For DateTime fields
			
		vm.datePickerConfig = datePickerConfig;	
		
        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
    				vm.addZHierarchy = addZHierarchy;
      		// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Implement private functions
        function activate() {
            onDestroy();
            onHasChanges();
						initLookups(); 
			            common.activateController([getRequestedAllDataType()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedAllDataType() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.allDataType = datacontext.allDataType.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.allDataType = datacontext.allDataType.create();
            }

            return datacontext.allDataType.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalAllDataType = cloneAllDataType(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.allDataType = data.entity || data;
				                    vm.selectedZHierarchy =  vm.allDataType.zHierarchyID ;

                      }, function (error) {
                    logError('Unable to get AllDataType ' + val);
                    goToAllDataTypes();
                });
        }

        // #region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
            urlHelper.replaceLocationUrlGuidWithId(vm.allDataType.allDataTypeID);
            if (vm.allDataType.entityAspect.entityState.isDetached()) {
                goToAllDataTypes();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAllDataTypes() {
            $location.path('/allDataTypes');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }
		
        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
	  vm.allDataType.zHierarchyID = vm.selectedZHierarchy;

   
			// Save Changes
            return datacontext.save("SaveAllDataTypes")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.allDataType,
                                        vm.actionType != 'D' ? vm.originalAllDataType : cloneAllDataType(vm.allDataType),
                                        vm.actionType != 'D' ? cloneAllDataType(vm.allDataType) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                    urlHelper.replaceLocationUrlGuidWithId(vm.allDataType.allDataTypeID);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;                    
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteAllDataType() {
            return bsDialog.deleteDialog('AllDataType')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.allDataType);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToAllDataTypes();
                }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        // #endregion

				function initLookups() {
				var lookups = datacontext.lookup.lookupCachedData;
	                      vm.zHierarchys = lookups.zHierarchys;
                  if (vm.allDataType !== undefined) {
                vm.selectedZHierarchy =  vm.allDataType.zHierarchyID ;
}

           }

        // #region Work in progress
        function storeWipEntity() {
            if (!vm.allDataType) { return; }
            var description = vm.allDataType.name || '[New AllDataType] id: ' + vm.allDataType.allDataTypeID; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.allDataType, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        // #endregion

        function cloneAllDataType(allDataType) {
            return {
		            AllDataTypeID: allDataType.allDataTypeID,
		            BigInt: allDataType.bigInt,
		            Binary: allDataType.binary,
		            Bit: allDataType.bit,
		            Char: allDataType.char,
		            Date: allDataType.date,
		            DateTime: allDataType.dateTime,
		            DateTime2: allDataType.dateTime2,
		            DateTimeOffset: allDataType.dateTimeOffset,
		            Decimal: allDataType.decimal,
		            Float: allDataType.float,
		            Geography: allDataType.geography,
		            Geometry: allDataType.geometry,
		            Image: allDataType.image,
		            Int: allDataType.int,
		            Money: allDataType.money,
		            NChar: allDataType.nChar,
		            NText: allDataType.nText,
		            Numeric: allDataType.numeric,
		            NVarChar: allDataType.nVarChar,
		            NVarCharMax: allDataType.nVarCharMax,
		            Real: allDataType.real,
		            SmallDateTime: allDataType.smallDateTime,
		            SmallInt: allDataType.smallInt,
		            SmallMoney: allDataType.smallMoney,
		            Text: allDataType.text,
		            Time: allDataType.time,
		            TimeStamp: allDataType.timeStamp,
		            TinyInt: allDataType.tinyInt,
		            UniqueIdentifier: allDataType.uniqueIdentifier,
		            VarBinary: allDataType.varBinary,
		            VarBinaryMax: allDataType.varBinaryMax,
		            VarChar: allDataType.varChar,
		            VarCharMax: allDataType.varCharMax,
		            Xml: allDataType.xml,
		            ZHierarchyID: allDataType.zHierarchyID,
		            ZSql_Variant: allDataType.zSql_Variant,
		        };
        }
		// #endregion
			// #region Modal Dialog
			function addZHierarchy(){
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/zHierarchy/zHierarchyItem.html',
                controller: 'zHierarchyItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newZHierarchy) {
                
                if (newZHierarchy) {
                    vm.zHierarchys.push(newZHierarchy);
                    vm.selectedZHierarchy =  vm.zHierarchys[vm.zHierarchys.length - 1].zHierarchyID;
                    vm.allDataType.zHierarchyID = vm.selectedZHierarchy;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

} ;
                  // #endregion
			    }
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'userListController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, UserListController);

    // 2. Inject dependencies
    UserListController.$inject = ['$location', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
    function UserListController($location, common, config, datacontext) {
        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        // #region Breeze client-side cached
        vm.users = [];
        vm.userCount = 0;
        vm.userFilteredCount = 0;
        vm.userSearch = '';

        vm.title = 'Users';
        vm.refresh = refresh;
        vm.search = search;
        vm.goToUser = goToUser;

        vm.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        vm.pageChanged = pageChanged;
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.userFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        vm.setSort = setSort;
        vm.theads = ['FirstName', 'MiddleName', 'LastName', 'Email', 'Birthday']; // Table headers
        vm.sorting = {
            orderBy: 'lastName',
            orderDesc: ''
        };
        // #endregion

        // #region server-side remote acess

        vm.usersServer = [];
        vm.usersServerFilter = [];
        vm.userCountServer = 0;
        vm.userFilteredCountServer = 0;
        vm.userServerSearch = '';
        vm.setUsersServerFilter = setUsersServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.userFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
            orderBy: 'lastName',
            orderDesc: ''
        };
        // #endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getUsers(), getUsersServer()], controllerId)
	            .then(function () { log('Activated Users View.'); });
        }

        function getUsers(forceRefresh) {
            return datacontext.user.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.userSearch)
				.then(function (data) {
				    vm.users = data;

				    if (!vm.userCount || forceRefresh) {
				        // Only grab the full count once or on refresh
				        getUserCount();
				    }
				    getUserFilteredCount();
				    return data;
				}
			);
        }

        function getUsersServer(forceRefresh) {
            return datacontext.user.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.userServerSearch)
                .then(function (data) {
                    vm.usersServerFilter = data;

                    if (!vm.userFilteredCountServer || forceRefresh) {
                        getUserCountServer();
                    }

                    getUserFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts
        function getUserCount() {
            return datacontext.user.getCount().then(function (data) {
                return vm.userCount = data;
            });
        }

        function getUserFilteredCount() {
            vm.userFilteredCount = datacontext.user.getFilteredCount(vm.userSearch);
        }

        function getUserCountServer() {
            return datacontext.user.getCount().then(function (data) {
                return vm.userCountServer = data;
            });
        }

        function getUserFilteredCountServer() {
            datacontext.user.getFilteredCountServer(vm.userServerSearch)
                .then(function (count) {
                    vm.userFilteredCountServer = count;
                });
        }
        // #endregion

        // #region Paging/Sorting/Filtering
        function pageChanged() {
            getUsers();
        }

        function pageChangedServer() {
            getUsersServer();
        }

        function refresh() { getUsers(true); }
        function refreshServer() { getUsersServer(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) { vm.userSearch = ''; }
            getUsers();
        }

        function searchServer() {
            return getUsersServer();
        }

        function setUsersServerFilter(user) {
            var textContains = common.textContains;
            var searchText = vm.usersServerSearch;

            var isMatch = searchText
                ? textContains(user.name, searchText)
                || textContains(user.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getUsers();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getUsersServer();
        }
        // #endregion

        function goToUser(user) {
            if (user && user.id) {
                $location.path('/user/' + user.id);
            }
        }

        // #endregion
    }
    // #endregion
})();
// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'userItemController';

	// 1. Add controller to module
    angular
		.module('app.features')
		.controller(controllerId, userItemController);

	// 2. Inject dependencies

   
userItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper','userCustomersListService'];
	// 3. Define controller
    function userItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper,userCustomersListService) {
   var vm = this;
 vm.userCustomersListService = userCustomersListService;

		// #region 3.1. Setup variables and functions
     
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.user;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Expose public bindable interface
		vm.activate = activate;
        vm.user = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalUser = null;

					vm.user1_Users = [];
            vm.selectedUser1_User =  null;
			$scope.$watch('vm.selectedUser1_User', function (newValue, oldValue) {
            if (newValue === oldValue) return;
            vm.hasChanges = true;
        });
      
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteUser = deleteUser;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

		// For DateTime fields
			
		vm.datePickerConfig = datePickerConfig;	
		
        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
    				vm.addUser1_User = addUser1_User;
      		// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Implement private functions
        function activate() {
            onDestroy();
            onHasChanges();
						initLookups(); 
			            common.activateController([getRequestedUser()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedUser() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.user = datacontext.user.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.user = datacontext.user.create();
            }
            return datacontext.user.getEntityByIdOrFromWip(val, true)
			    .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalUser = cloneUser(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.user = data.entity || data;
				                    vm.selectedUser1_User =  vm.user.user1_UserID ;

      
vm.userCustomersListService.populateList(vm.user.customers);
                }, function (error) {
                    logError('Unable to get User ' + val);
                    goToUsers();
                });
        }

        // #region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
            urlHelper.replaceLocationUrlGuidWithId(vm.user.userID);
            if (vm.user.entityAspect.entityState.isDetached()) {
                goToUsers();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToUsers() {
            $location.path('/users');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }
		
        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
	  vm.user.user1_UserID = vm.selectedUser1_User;

   
			// Save Changes
            return datacontext.save("SaveUsers")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.user,
                                        vm.actionType != 'D' ? vm.originalUser : cloneUser(vm.user),
                                        vm.actionType != 'D' ? cloneUser(vm.user) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                    urlHelper.replaceLocationUrlGuidWithId(vm.user.userID);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;                    
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteUser() {
            return bsDialog.deleteDialog('User')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.user);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToUsers();
                }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        // #endregion

				function initLookups() {
				var lookups = datacontext.lookup.lookupCachedData;
	                      vm.user1_Users = lookups.user1_Users;
                  if (vm.user !== undefined) {
                vm.selectedUser1_User =  vm.user.user1_UserID ;
}

           }

        // #region Work in progress
        function storeWipEntity() {
            if (!vm.user) { return; }
            var description = vm.user.name || '[New User] id: ' + vm.user.userID; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.user, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        // #endregion

        function cloneUser(user) {
            return {
		            UserID: user.userID,
		            StatusID: user.statusID,
		            CreatedDate: user.createdDate,
		            UpdatedDate: user.updatedDate,
		            CreateBy: user.createBy,
		            UpdateBy: user.updateBy,
		            FirstName: user.firstName,
		            MiddleName: user.middleName,
		            LastName: user.lastName,
		            Company: user.company,
		            Department: user.department,
		            JobTitle: user.jobTitle,
		            WorkNumber: user.workNumber,
		            WorkFaxNumber: user.workFaxNumber,
		            WorkAddress: user.workAddress,
		            IM: user.iM,
		            Email: user.email,
		            MobileNumber: user.mobileNumber,
		            WebPage: user.webPage,
		            OfficeLocation: user.officeLocation,
		            HomeNumber: user.homeNumber,
		            HomeAddress: user.homeAddress,
		            OtherAddress: user.otherAddress,
		            PagerNumber: user.pagerNumber,
		            CarNumber: user.carNumber,
		            HomeFax: user.homeFax,
		            CompanyNumber: user.companyNumber,
		            Work2Number: user.work2Number,
		            Home2Number: user.home2Number,
		            RadioNumber: user.radioNumber,
		            IM2: user.iM2,
		            IM3: user.iM3,
		            Email2: user.email2,
		            Email3: user.email3,
		            Assistant: user.assistant,
		            AssistantNumber: user.assistantNumber,
		            Manager: user.manager,
		            GovtID: user.govtID,
		            Account: user.account,
		            Birthday: user.birthday,
		            Anniversary: user.anniversary,
		            Spouse: user.spouse,
		            Children: user.children,
		            IUserID: user.iUserID,
		            PhotoUrl: user.photoUrl,
		            PledgeAmount: user.pledgeAmount,
		            NewsLetterEmail: user.newsLetterEmail,
		            OtherInfo: user.otherInfo,
		            User1_UserID: user.user1_UserID,
		        };
        }
		// #endregion
			// #region Modal Dialog
			function addUser1_User(){
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/user1_User/user1_UserItem.html',
                controller: 'user1_UserItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newUser1_User) {
                
                if (newUser1_User) {
                    vm.user1_Users.push(newUser1_User);
                    vm.selectedUser1_User =  vm.user1_Users[vm.user1_Users.length - 1].user1_UserID;
                    vm.user.user1_UserID = vm.selectedUser1_User;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

} ;
                  // #endregion
			    }
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'StylingController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, StylingController);

    // 2. Inject dependencies
    StylingController.$inject = ['bootstrap.dialog', 'common'];

    // #region 3. Define controller
    function StylingController(bsDialog, common) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logSuccess = getLogFn(controllerId, 'success');
        var logWarning = getLogFn(controllerId, 'warning');
        var logError = getLogFn(controllerId, 'error');

        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.title = {
            toastr: 'Toastr v.2.0.3',
            fa: 'FontAwesome v4.2.0',
            bs: 'Bootstrap v3.2.0'
        }
        vm.subtitle = {
            fa: 'The iconic font and CSS toolkit',
            toastr: 'Simple Javascript toast notifications',
            bs: 'HTML, CSS, and Javascript code designed to help build user interface components'
        }

        vm.showToast = showToast;
        vm.repeat = repeat;
        vm.showModal = showModal;

        vm.activate = activate;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated Boostrap Demo View.'); });
        }

        function repeat(num) {
            return new Array(num);
        }

        function showToast(name) {
            switch (name) {
                default:
                {
                    log('Toast default notification.');
                    break;
                }
                case 'success':
                {
                    logSuccess('Toast success notification.');
                    break;
                }
                case 'warn':
                {
                    logWarning('Toast warning notification.');
                    break;
                }
                case 'error':
                {
                    logError('Toast error notification.');
                    break;
                }
                case 'clear':
                {
                    toastr.clear();
                }
            }
        }

        function showModal(name) {
            switch (name) {
            case'error':
            {
                return bsDialog.deleteDialog('item');
            }
            default:
            {
                return bsDialog.confirmationDialog('Modal heading', 'Modal body', 'OK', 'Cancel');
            }
            }
        }
        // #endregion
    }
    // #endregion
})();

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
// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'UiController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, UiController);

    // 2. Inject dependencies
    UiController.$inject = ['$scope', '$timeout', 'bootstrap.dialog', 'common'];

    // #region 3. Define controller
    function UiController($scope, $timeout, bsDialog, common) {

        // #region 3.1 Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logWarning = getLogFn(controllerId, 'warn');

        var vm = this;
        // #endregion

        // #region 3.2 Define bindable variables to the view
        //#region HighCharts
        vm.chartTypes = [
            { 'id': 'line', 'title': 'Line' },
            { 'id': 'spline', 'title': 'Smooth line' },
            { 'id': 'area', 'title': 'Area' },
            { 'id': 'areaspline', 'title': 'Smooth area' },
            { 'id': 'column', 'title': 'Column' },
            { 'id': 'bar', 'title': 'Bar' },
            { 'id': 'pie', 'title': 'Pie' },
            { 'id': 'scatter', 'title': 'Scatter' }
        ];

        vm.chartSeries = [
            { 'name': 'Smooth Area', 'data': [1, 2, 4, 7, 3], type: 'areaspline' },
            { 'name': 'Line', 'data': [3, 1, null, 5, 2], connectNulls: true, type: 'line' },
            { 'name': 'Column 1', 'data': [5, 2, 2, 3, 5], type: 'column' },
            { 'name': 'Column 2', 'data': [1, 1, 2, 3, 2], type: 'column' }
        ];

        vm.chartStack = [
            { "id": '', "title": "No" },
            { "id": "normal", "title": "Normal" },
            { "id": "percent", "title": "Percent" }
        ];

        vm.addPoints = function () {
            var seriesArray = vm.chartConfig.series;
            var rndIdx = Math.floor(Math.random() * seriesArray.length);
            seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20]);
        };

        vm.addSeries = function () {
            var rnd = []
            for (var i = 0; i < 10; i++) {
                rnd.push(Math.floor(Math.random() * 20) + 1);
            }
            vm.chartConfig.series.push({
                data: rnd
            });
        }

        //vm.removeRandomSeries = function() {
        //    if (vm.chartConfig.series.length == 1) {
        //        return logWarning('HighCharts: There should be at least 1 series.');
        //    }
        //    var seriesArray = vm.chartConfig.series;
        //    var rndIdx = Math.floor(Math.random() * seriesArray.length);
        //    seriesArray.splice(rndIdx, 1);
        //}

        vm.removeSeries = function (id) {
            return bsDialog.confirmationDialog('Remove', 'Do you want remove this series?', 'Yes', 'No')
               .then(confirm);

            function confirm() {
                if (vm.chartConfig.series.length == 1) {
                    return logWarning('HighCharts: There should be at least 1 series.');
                }

                var seriesArray = vm.chartConfig.series;
                seriesArray.splice(id, 1);
            }
        }

        vm.chartConfig = {
            options: {
                chart: {
                    type: vm.chartTypes[0].id
                    },
                plotOptions: {
                    series: {
                        dataLabels: { enabled: true, style: { fontSize: '15px' } },
                        stacking: ''
                    }
                }
            },
            credits: {
                enabled: true,
            },
            series: vm.chartSeries,
            title: {
                text: 'HighCharts Demo'
            }
        }
        //#endregion

        //#region Wijmo 5 FlexGrid // http://demos.componentone.com/wijmo/5/Angular/FlexGridIntro/FlexGridIntro/
        var countries = 'US,Germany,UK,Japan,Italy,Greece'.split(','),
        data = [];
        for (var i = 0; i < 100; i++) {
            data.push({
                id: i,
                country: countries[i % countries.length],
                date: new Date(2014, i % 12, i % 28),
                amount: Math.random() * 10000,
                active: i % 4 == 0
            });
        }
        vm.data = data;

        vm.selectionMode = 'CellRange';
        vm.isReadOnly = false;

        // Paging
        vm.cvData = new wijmo.collections.CollectionView(data);
        vm.cvData.pageSize = 20;

        // Grouping
        vm.groupBy = '';
        $scope.$watch('vm.groupBy', function () { // update CollectionView group descriptions when groupBy changes
            var cv = vm.cvData;
            cv.groupDescriptions.clear(); // clear current groups
            if (vm.groupBy) {
                var groupNames = vm.groupBy.split(',');
                for (var i = 0; i < groupNames.length; i++) {
                    var groupName = groupNames[i];
                    if (groupName == 'date') { // ** group dates by year
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                            return item.date.getFullYear();
                        });
                        cv.groupDescriptions.push(groupDesc);
                    } else if (groupName == 'amount') { // ** group amounts in ranges
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName, function (item, prop) {
                            return item.amount >= 5000 ? '> 5,000' : item.amount >= 500 ? '500 to 5,000' : '< 500';
                        });
                        cv.groupDescriptions.push(groupDesc);
                    } else { // ** group everything else by value
                        var groupDesc = new wijmo.collections.PropertyGroupDescription(groupName);
                        cv.groupDescriptions.push(groupDesc);
                    }
                }
            }
        });

        // Filtering
        vm.filter = '';
        var toFilter, lcFilter;
        vm.cvData.filter = function (item) { // ** filter function
            if (!vm.filter) { return true; }
            return item.country.toLowerCase().indexOf(lcFilter) > -1;
        };
        $scope.$watch('vm.filter', function () { // ** refresh view when filter changes
            if (toFilter) { clearTimeout(toFilter); }
            toFilter = setTimeout(function () {
                lcFilter = vm.filter.toLowerCase();
                vm.cvData.refresh();
            }, 500);
        });

        //// Master-Detail
        //vm.cvData.currentChanged.addHandler(function () {
        //    $scope.$apply('vm.cvData.currentItem');
        //});

        // Conditional Styling
        vm.getAmountColor = function (amount) {
            if (amount < 2500) return 'black';
            if (amount < 5000) return 'green';
            return 'blue';
        }

        // Custom Theming
        vm.useTheme = false;
        vm.theme = '';
        $scope.$watch('vm.useTheme', function () {
            if (vm.useTheme) { vm.theme = 'custom-flex-grid'; }
            else { vm.theme = ''; }
        });

        // Trees and Hierarchical Data
        vm.treeData = [
            {
                name: '\u266B Adriane Simione',
                items: [
                    {
                        name: '\u266A Intelligible Sky',
                        items: [
                            { name: 'Theories', length: '2:02' },
                            { name: 'Giant Eyes', length: '3:29' },
                            { name: 'Jovian Moons', length: '1:02' },
                            { name: 'Open Minds', length: '2:41' },
                            { name: 'Spacetronic Eyes', length: '3:41' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Amy Winehouse',
                items: [
                    {
                        name: '\u266A Back to Black',
                        items: [
                            { name: 'Addicted', length: '1:34' },
                            { name: 'He Can Only Hold Her', length: '2:22' },
                            { name: 'Some Unholy War', length: '2:21' },
                            { name: 'Wake Up Alone', length: '3:43' },
                            { name: 'Tears Dry On Their Own', length: '1:25' }
                        ]
                    },
                    {
                        name: '\u266A Live in Paradiso',
                        items: [
                            { name: "You Know That I'm No Good", length: '2:32' },
                            { name: 'Wake Up Alone', length: '1:04' },
                            { name: 'Valerie', length: '1:22' },
                            { name: 'Tears Dry On Their Own', length: '3:15' },
                            { name: 'Rehab', length: '3:40' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Black Sabbath',
                items: [
                    {
                        name: '\u266A Heaven and Hell',
                        items: [
                            { name: 'Neon Knights', length: '3:03' },
                            { name: 'Children of the Sea', length: '2:54' },
                            { name: 'Lady Evil', length: '1:43' },
                            { name: 'Heaven and Hell', length: '2:23' },
                            { name: 'Wishing Well', length: '3:22' },
                            { name: 'Die Young', length: '2:21' }
                        ]
                    },
                    {
                        name: '\u266A Never Say Die!',
                        items: [
                            { name: 'Swinging The Chain', length: '4:32' },
                            { name: 'Breakout', length: '3:54' },
                            { name: 'Over To You', length: '2:43' },
                            { name: 'Air Dance', length: '1:34' },
                            { name: 'Johnny Blade', length: '1:02' },
                            { name: 'Never Say Die', length: '2:11' }
                        ]
                    },
                    {
                        name: '\u266A Paranoid',
                        items: [
                            { name: 'Rat Salad', length: '3:44' },
                            { name: 'Hand Of Doom', length: '4:21' },
                            { name: 'Electric Funeral', length: '2:12' },
                            { name: 'Iron Man', length: '3:22' },
                            { name: 'War Pigs', length: '3:13' }
                        ]
                    }
                ]
            },
            {
                name: '\u266B Brand X',
                items: [
                    {
                        name: '\u266A Unorthodox Behaviour',
                        items: [
                            { name: 'Touch Wood', length: '2:54' },
                            { name: 'Running of Three', length: '1:34' },
                            { name: 'Unorthodox Behaviour', length: '2:23' },
                            { name: 'Smacks of Euphoric Hysteria', length: '3:12' },
                            { name: 'Euthanasia Waltz', length: '2:22' },
                            { name: 'Nuclear Burn', length: '4:01' }
                        ]
                    }
                ]
            }
        ];
        //#endregion

        //#region KendoUI
        // AutoComplete
        vm.countryNames = [
        "Albania","Andorra","Armenia","Austria","Azerbaijan","Belarus","Belgium","Bosnia & Herzegovina",
        "Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Georgia",
        "Germany","Greece","Hungary","Iceland","Ireland","Italy","Kosovo","Latvia","Liechtenstein",
        "Lithuania","Luxembourg","Macedonia","Malta","Moldova","Monaco","Montenegro","Netherlands",
        "Norway","Poland","Portugal","Romania","Russia","San Marino","Serbia","Slovakia","Slovenia",
        "Spain","Sweden","Switzerland","Turkey","Ukraine","United Kingdom","Vatican City"
        ];

        //// Calendar
        //$scope.$watch("vm.startDate", function (val) {
        //    var maxEndDate = new Date(val);
        //    maxEndDate.setDate(maxEndDate.getDate() + 14);
        //    vm.maxEndDate = maxEndDate;
        //    delete vm.endDate;
        //});

        // ComboBox RemoteData
        //vm.productsDataSource = {
        //    type: "odata",
        //    serverFiltering: true,
        //    transport: {
        //        read: {
        //            url: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Products",
        //        }
        //    }
        //}

        // DropDownList
        //vm.customersDataSource = {
        //    transport: {
        //        read: {
        //            dataType: "jsonp",
        //            url: "https://demos.telerik.com/kendo-ui/service/Customers",
        //        }
        //    }
        //};

        //vm.customOptions = {
        //    dataSource: vm.customersDataSource,
        //    dataTextField: "ContactName",
        //    dataValueField: "CustomerID",

        //    headerTemplate: '<div class="dropdown-header">' +
        //        '<span class="k-widget k-header">Photo</span>' +
        //        '<span class="k-widget k-header">Contact info</span>' +
        //        '</div>',

        //    // using {{angular}} templates:
        //    valueTemplate: '<img class="selected-value" src=\"https://demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.CustomerID}}.jpg\" alt=\"{{dataItem.CustomerID}}\" /><span>{{dataItem.ContactName}}</span>',

        //    template: '<span class="k-state-default"><img src=\"https://demos.telerik.com/kendo-ui/content/web/Customers/{{dataItem.CustomerID}}.jpg\" alt=\"{{dataItem.CustomerID}}\" /></span>' +
        //        '<span class="k-state-default"><h3>{{dataItem.ContactName}}</h3><p>{{dataItem.CompanyName}}</p></span>',
        //};

        // Editor
    //    vm.html = "<h1>Kendo Editor</h1>\n\n" +
    //"<p>Note that “change” is triggered when the editor loses focus.\n" +
    //"<br /> That's when the Angular scope gets updated.</p>";

        // MaskedTextBox
        vm.phone = "555 123 4567";
        vm.cc = "1234 1234 1234 1234";
        vm.ssn = "003-12-3456";
        vm.post = "W1N 1AC";

        // Menu
        vm.menuOrientation = "horizontal";
        vm.onSelect = function (ev) {
            log($(ev.item.firstChild).text());
        };

        // MultiSelect
        //vm.selectOptions = {
        //    placeholder: "Select products...",
        //    dataTextField: "ProductName",
        //    dataValueField: "ProductID",
        //    autoBind: false,
        //    dataSource: {
        //        type: "odata",
        //        serverFiltering: true,
        //        transport: {
        //            read: {
        //                url: "https://demos.telerik.com/kendo-ui/service/Northwind.svc/Products",
        //            }
        //        }
        //    }
        //};
        vm.selectedIds = [4, 7];

        // NumericTextbox
        vm.ntValue = 50;

        // ProgressBar
        vm.status = "Working...";
        vm.progress = 0;
        vm.labels = [
          "Installing start menu items",
          "Registering components",
          "Having a coffee"
        ];
        var i = -1;
        function update() {
            vm.progress += random(0, 10);
            if (vm.progress > random(70, 90)) {
                vm.progress = random(5, 50);
                i = (i + 1) % vm.labels.length;
                vm.status = vm.labels[i];
            }
            $timeout(update, 200);
        }
        function random(a, b) {
            return a + Math.floor(Math.random() * (b - a));
        }
        update();

        // Spliter
        vm.orientation = "horizontal";
        //#endregion
        // #endregion

        // 3.3 Run activate method
        activate();

        // #region 3.4 Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated UI Elements View'); });
        }
        // #endregion
    }
    // #endregion
})();

// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'FileUploadController';

    // 1. Get 'app' module and define controller
    angular.module('app.features').controller(controllerId, FileUploadController);

    // 2. Inject dependencies
    FileUploadController.$inject = ['$scope', 'common', 'FileUploader', '$location', 'config', 'datacontext'];

    // #region 3. Define controller
    function FileUploadController($scope, common, FileUploader, $location, config, datacontext) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.rootFilePath = '/UploadFiles';
        // initial image index
        $scope._Index = 0;

        // if a current image is the same as requested image
        $scope.isActive = function (index) {
            return $scope._Index === index;
        };

        // show prev image
        $scope.showPrev = function () {
            $scope._Index = ($scope._Index > 0) ? --$scope._Index : vm.attachments.length - 1;
        };

        // show next image
        $scope.showNext = function () {
            $scope._Index = ($scope._Index < vm.attachments.length - 1) ? ++$scope._Index : 0;
        };

        // show a certain image
        $scope.showPhoto = function (index) {
            $scope._Index = index;
        };

        // show clicked row image
        vm.showGallary = function(a) {
            for (var i = 0; i < vm.attachments.length; i++) {
                if (vm.attachments[i].filePath == a.filePath) {
                    return $scope._Index = i;
                }
            }
        }

        vm.uploader = new FileUploader({
            url: "/api/File/"
        });

        // FILTERS
        vm.uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        vm.attachments = [];
        vm.attachmentCount = 0;
        vm.attachmentFilteredCount = 0;
        vm.attachmentSearch = '';

        vm.title = 'Attachments';
        vm.refresh = refresh;
        vm.search = search;

        vm.paging = {
            currentPage: 1,
            maxPagesToShow: 5,
            pageSize: 7
        };
        vm.pageChanged = pageChanged;
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.attachmentFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        vm.setSort = setSort;
        vm.theads = ['File Name'];
        vm.sorting = {
            orderBy: 'fileName',
            orderDesc: ''
        };

        // Uploader's Callback
        vm.uploader.onCompleteItem = function (fileItem, response, status, headers) {
            //console.info('onCompleteItem', fileItem, response, status, headers);
            refresh();
        };
        //vm.uploader.onCompleteAll = function () {
        //    //console.info('onCompleteAll');
        //    refresh();
        //};
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getAttachments(true)], controllerId)
                .then(function () {
                    log('Activated File Uploading View.');
                });
        }

        function getAttachments(forceRefresh) {
            return datacontext.attachment.getAll(forceRefresh, vm.sorting.orderBy, vm.sorting.orderDesc,
				vm.paging.currentPage, vm.paging.pageSize, vm.attachmentSearch)
				.then(function (data) {
				    vm.attachments = data;
				    if (!vm.attachmentCount || forceRefresh) {
				        getAttachmentCount();
				    }
				    getAttachmentFilteredCount();
				}
			);
        }

        //#region Get Counts
        function getAttachmentCount() {
            return datacontext.attachment.getCount().then(function (data) {
                return vm.attachmentCount = data;
            });
        }

        function getAttachmentFilteredCount() {
            vm.attachmentFilteredCount = datacontext.attachment.getFilteredCount(vm.attachmentSearch);
        }
        //#endregion

        //#region Paging/Sorting/Filtering
        function pageChanged() {
            getAttachments();
        }

        function refresh() { getAttachments(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) { vm.attachmentSearch = ''; }
            getAttachments();
        }

        function setSort(prop) {
            // Process orderBy and orderDesc
            prop = prop.replace(/ /g, '');
            vm.sorting.orderBy = prop.charAt(0).toLowerCase() + prop.slice(1);
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            // Check if Local inline count =< server inline count
            var serverInlineCount, forceRemote = true;
            datacontext.attachment.getCount(forceRemote).then(function (data) {
                serverInlineCount = data;
                if (vm.attachmentCount <= serverInlineCount) {
                    // Sort locally
                    getAttachments().then(function (data) { return vm.attachments = data; });
                } else {
                    // Go remotely
                    getAttachments(forceRemote).then(function (data) { return vm.attachments = data; });
                }
            });
        }
        //#endregion
        // #endregion
    }
    // #endregion
})();

////// uploader's CALLBACKS

////uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
////    console.info('onWhenAddingFileFailed', item, filter, options);
////};
////uploader.onAfterAddingFile = function (fileItem) {
////    console.info('onAfterAddingFile', fileItem);
////};
////uploader.onAfterAddingAll = function (addedFileItems) {
////    console.info('onAfterAddingAll', addedFileItems);
////};
////uploader.onBeforeUploadItem = function (item) {
////    console.info('onBeforeUploadItem', item);
////};
////uploader.onProgressItem = function (fileItem, progress) {
////    console.info('onProgressItem', fileItem, progress);
////};
////uploader.onProgressAll = function (progress) {
////    console.info('onProgressAll', progress);
////};
////uploader.onSuccessItem = function (fileItem, response, status, headers) {
////    console.info('onSuccessItem', fileItem, response, status, headers);
////};
////uploader.onErrorItem = function (fileItem, response, status, headers) {
////    console.info('onErrorItem', fileItem, response, status, headers);
////};
////uploader.onCancelItem = function (fileItem, response, status, headers) {
////    console.info('onCancelItem', fileItem, response, status, headers);
////};
////uploader.onCompleteItem = function (fileItem, response, status, headers) {
////    console.info('onCompleteItem', fileItem, response, status, headers);
////};
////uploader.onCompleteAll = function () {
////    console.info('onCompleteAll');
////};

////console.info('uploader', uploader);
// 0. IIFE (Immediately-invoked function expression)
(function () {
/**
 * @description
 * 
 * Controller for work in progress (WIP) view
 * - Get wip list and all wip items.
 * - Cancel wip.
 * - Go to wip item.
 */

    'use strict';

    var controllerId = 'WipController';

    // 1. Get 'app' module and define controller
    angular.module('app.features').controller(controllerId, WipController);

    // 2. Inject dependencies
    WipController.$inject = ['$scope', '$location',
            'bootstrap.dialog', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
    function WipController($scope, $location,
        bsDialog, common, config, datacontext) {
        // 3.1. Define functions
        var vm = this;

        // #region 3.2. Define bindable variables to the view
        vm.cancelAllWip = cancelAllWip;
        vm.gotoWip = gotoWip;
        vm.predicate = '';
        vm.reverse = false;
        vm.setSort = setSort;
        vm.title = 'Work in Progress';
        vm.wip = [];
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([getWipSummary()], controllerId);

            $scope.$on(config.events.storage.wipChanged, function (event, data) {
                vm.wip = data;
            });
        }

        function getWipSummary() {
            vm.wip = datacontext.zStorageWip.getWipSummary();
        }

        function cancelAllWip() {
            vm.isDeleting = true;

            return bsDialog.deleteDialog('Work in Progress')
                .then(confirmDelete, cancelDelete);

            function cancelDelete() { vm.isDeleting = false; }

            function confirmDelete() {
                datacontext.zStorageWip.clearAllWip();
                vm.isDeleting = false;
            }
        }

        function setSort(prop) {
            vm.predicate = prop;

            vm.reverse = !vm.reverse;
        }

        function gotoWip(wipData) {
            var entityName = wipData.entityName;
            entityName = entityName.charAt(0).toLowerCase() + entityName.slice(1);
            $location.path('/' + entityName + '/' + wipData.key);
        }
        // #endregion
    }
    // #endregion
})();
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
// 0. IIFE (Immediately-invoked function expression)
(function () {
/**
 * @description
 * 
 * Controller for register view to register local account.
 */
    'use strict';

    var controllerId = 'RegisterController';

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

        vm.registration = {
            userName: '',
            email: '',
            password: '',
            confirmPassword: ''
        }

        vm.register = registerServer;
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
            var passwordStrength = common.strongPasswordChecker(vm.registration.password);
            if (passwordStrength == "weak" || passwordStrength == "") {
                return logWarning('Weak password, try to use a long mixed password with: ' + '<br/>' +
                    '- lower-case characters' + '<br/>' +
                    '- upper-case characters' + '<br/>' +
                    '- digits' + '<br/>' +
                    '- unique characters.');
            }
            
            // Check captcha
            if (!vm.captchaValid) return logWarning('Please enter the correct Math addition.');

            authService.register(vm.registration)
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

/**
 * @description
 * 
 * Read the URL hash fragments and pass them to AngularJS controller in callback function, 
 * based on the value of the fragment (hasLocalAccount) the AngularJS controller will decide to call 
 * end point “/ObtainLocalAccessToken” or display a view named “associate” where it will give the end user 
 * the chance to set preferred username only and then call the endpoint “/RegisterExternal”.
 */

window.common = (function () {
    var common = {};

    common.getFragment = function getFragment() {
        if (window.location.hash.indexOf("#") === 0) {
            return parseQueryString(window.location.hash.substr(1));
        } else {
            return {};
        }
    };

    function parseQueryString(queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    }

    return common;
})();
var fragment = common.getFragment();

if (fragment.state != undefined) {
    window.location.hash = fragment.state || '';
}

if (window.opener != null) {
    window.opener.$windowScope.authCompletedCB(fragment);
    window.close();
}
// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AssociateController';

    // 1. Get 'app' module and define controller
    angular
        .module('app.features')
        .controller(controllerId, AssociateController);

    // 2. Inject dependencies
    AssociateController.$inject = ['authService', 'common'];

    // #region 3. Define controller
    function AssociateController(authService, common) {

        // #region 3.1. Define functions
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerId, 'error');
        var log = getLogFn(controllerId);
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.registerExternal = registerExternal;

        vm.registerData = {
            userName: authService.externalAuthData.userName,
            provider: authService.externalAuthData.provider,
            externalAccessToken: authService.externalAuthData.externalAccessToken
        };

        vm.activate = activate;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController(controllerId)
                .then(function () { log('Activated Account Association View.'); });
        }

        function registerExternal() {
            authService.registerExternal(vm.registerData)
                .then(success).catch(failed);

            function success() {
                log('Account has been registered successfully, redicted to Dashboard in 2 seconds.');
                authService.startTimer('');
            }

            function failed(response) {
                logError('Registration failed: ' + response.message);
            }
        };
        // #endregion
    }
    // #endregion
})();









// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'accessControlListItemListController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AccessControlListItemListController);

    // 2. Inject dependencies
    AccessControlListItemListController.$inject = ['$location', 'common', 'config', 'datacontext'];

    // #region 3. Define controller
    function AccessControlListItemListController($location, common, config, datacontext) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        // #region Breeze client-side cached
        vm.accessControlListItems = [];
        vm.permissions = [];
        vm.accessControlListItemCount = 0;
        vm.accessControlListItemFilteredCount = 0;
        vm.accessControlListItemSearch = '';

        vm.title = 'AccessControlListItems';
        vm.refresh = refresh;
        vm.search = search;
        vm.goToAccessControlListItem = goToAccessControlListItem;

        vm.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };
        vm.pageChanged = pageChanged;
        Object.defineProperty(vm.paging, 'pageCount', {
            get: function () {
                return Math.floor(vm.accessControlListItemFilteredCount / vm.paging.pageSize) + 1;
            }
        });

        vm.setSort = setSort;
        vm.theads = ['Role', 'Domain Object', 'Permission']; // Table headers
        vm.sorting = {
            orderBy: 'permissionValue',
            orderDesc: ''
        };
        // #endregion

        // #region server-side remote acess

        vm.accessControlListItemsServer = [];
        vm.accessControlListItemsServerFilter = [];
        vm.accessControlListItemCountServer = 0;
        vm.accessControlListItemFilteredCountServer = 0;
        vm.accessControlListItemServerSearch = '';
        vm.setAccessControlListItemsServerFilter = setAccessControlListItemsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.accessControlListItemFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
            orderBy: 'permissionValue',
            orderDesc: ''
        };

        // fields for relative entities 

        vm.selectedDomainObject = null;
        vm.selectedDomainObjectServer = null;
        vm.selectedRole = null;
        vm.selectedRoleServer = null;

        // #endregion
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            initLookups();
            common.activateController([getAccessControlListItems()
                                       , getAccessControlListItemsServer()
    , getDomainObjects()
       , getRoles()

            ], controllerId)
				.then(function () { log('Activated AccessControlListItems View.'); });
        }

        function getDomainObjects() {
            return datacontext.domainObject.getAllWithoutPaging().then(function (data) {
                vm.domainObjects = data;
            });
        }
        function getRoles() {
            return datacontext.aspNetRole.getAllWithoutPaging().then(function (data) {
                vm.roles = data;
            });
        }

        function getAccessControlListItems(forceRefresh) {
            return datacontext.accessControlListItem.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.accessControlListItemSearch)
				.then(function (data) {
                    vm.accessControlListItems = data;
                    for (var i = 0; i < vm.accessControlListItems.length; i++) {
                        vm.accessControlListItems[i].permissions = '';
                        for (var j = 0; j < vm.permissions.length; j++) {
                            if ((vm.accessControlListItems[i].permissionValue & vm.permissions[j].value) == vm.permissions[j].value) {
                                vm.accessControlListItems[i].permissions += vm.permissions[j].description + '|';
                            }
                        }
                    }

				    if (!vm.accessControlListItemCount || forceRefresh) {
				        // Only grab the full count once or on refresh
				        getAccessControlListItemCount();
				    }
				    getAccessControlListItemFilteredCount();
				    return data;
				}
			);
        }

        function getAccessControlListItemsServer(forceRefresh) {
            return datacontext.accessControlListItem.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.accessControlListItemServerSearch)
                .then(function (data) {
                    vm.accessControlListItemsServerFilter = data;

                    if (!vm.accessControlListItemFilteredCountServer || forceRefresh) {
                        getAccessControlListItemCountServer();
                    }

                    getAccessControlListItemFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts
        function getAccessControlListItemCount() {
            return datacontext.accessControlListItem.getCount().then(function (data) {
                return vm.accessControlListItemCount = data;
            });
        }

        function getAccessControlListItemFilteredCount() {
            vm.accessControlListItemFilteredCount = datacontext.accessControlListItem.getFilteredCount(vm.accessControlListItemSearch);
        }

        function getAccessControlListItemCountServer() {
            return datacontext.accessControlListItem.getCount().then(function (data) {
                return vm.accessControlListItemCountServer = data;
            });
        }

        function getAccessControlListItemFilteredCountServer() {
            datacontext.accessControlListItem.getFilteredCountServer(vm.accessControlListItemServerSearch)
                .then(function (count) {
                    vm.accessControlListItemFilteredCountServer = count;
                });
        }
        // #endregion

        // #region Paging/Sorting/Filtering
        function pageChanged() {
            getAccessControlListItems();
        }

        function pageChangedServer() {
            getAccessControlListItemsServer();
        }

        function refresh() { getAccessControlListItems(true); }
        function refreshServer() { getAccessControlListItemsServer(true); }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) { vm.accessControlListItemSearch = ''; }
            getAccessControlListItems();
        }

        function searchServer() {
            return getAccessControlListItemsServer();
        }

        function setAccessControlListItemsServerFilter(accessControlListItem) {
            var textContains = common.textContains;
            var searchText = vm.accessControlListItemsServerSearch;

            var isMatch = searchText
                ? textContains(accessControlListItem.name, searchText)
                || textContains(accessControlListItem.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAccessControlListItems();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAccessControlListItemsServer();
        }
        // #endregion

        function goToAccessControlListItem(accessControlListItem) {
            if (accessControlListItem && accessControlListItem.id) {
                $location.path('/accessControlListItem/' + accessControlListItem.id);
            }
        }

        // #region Relative entities


        vm.onDomainObjectSelectionChange = function () {
            // get all AccessControlListItems (from local) by DomainObjectId.
            if (vm.selectedDomainObject != null) {
                datacontext.accessControlListItem.getAllByDomainObjectId(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedDomainObject.id)
                .then(function (results) {
                    vm.accessControlListItems = results;
                    vm.accessControlListItemFilteredCount = results.length;
                });
            }
            else {
                getAccessControlListItems(false);
            }
        }

        vm.onDomainObjectServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedDomainObjectServer != null) {
                datacontext.accessControlListItem.getAllByDomainObjectId(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedDomainObjectServer.id)
                .then(function (results) {
                    vm.accessControlListItemsServerFilter = results;
                    vm.accessControlListItemFilteredCountServer = results.length;
                });
            }
            else {
                getAccessControlListItemsServer(true);
            }
        }

        vm.onRoleSelectionChange = function () {
            // get all AccessControlListItems (from local) by RoleId.
            if (vm.selectedRole != null) {
                datacontext.accessControlListItem.getAllByRoleId(
                    false,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedRole.id)
                .then(function (results) {
                    vm.accessControlListItems = results;
                    vm.accessControlListItemFilteredCount = results.length;
                });
            }
            else {
                getAccessControlListItems(false);
            }
        }

        vm.onRoleServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedRoleServer != null) {
                datacontext.accessControlListItem.getAllByRoleId(
                    true,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.selectedRoleServer.id)
                .then(function (results) {
                    vm.accessControlListItemsServerFilter = results;
                    vm.accessControlListItemFilteredCountServer = results.length;
                });
            }
            else {
                getAccessControlListItemsServer(true);
            }
        }
        // #endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;

            // Permissions lookup list
            vm.permissions = lookups.permissions;
        }


        // #endregion
    }
    // #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'accessControlListItemItemController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AccessControlListItemItemController);

    // 2. Inject dependencies
    AccessControlListItemItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
    // #region 3. Define controller
    function AccessControlListItemItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.accessControlListItem;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.accessControlListItem = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAccessControlListItem = null;

        vm.domainObjects = [];
        vm.selectedDomainObject = null;
        vm.roles = [];
        vm.selectedRole = null;
        vm.permissions = [];

        vm.readPermission = null;
        vm.writePermission = null;
        vm.deletePermission = null;

        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.selectedDomainObjectChanged = selectedDomainObjectChanged;
        vm.selectedRoleChanged = selectedRoleChanged;
        vm.permissionChanged = permissionChanged;
        vm.deleteAccessControlListItem = deleteAccessControlListItem;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        // For DateTime fields


        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
        vm.addDomainObject = addDomainObject;
        vm.addRole = addRole;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            initLookups();
            common.activateController([getRequestedAccessControlListItem()], controllerId)
    .then(onEveryChange());
        }

        function getRequestedAccessControlListItem() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.accessControlListItem = datacontext.accessControlListItem.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.accessControlListItem = datacontext.accessControlListItem.create();
            }

            return datacontext.accessControlListItem.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalAccessControlListItem = cloneAccessControlListItem(data);

                    // If get data from WIP, need to use data.entity, otherwise use data.
                    wipEntityKey = data.key;
                    vm.accessControlListItem = data.entity || data;
                    setPermissions();
                    vm.selectedDomainObject = vm.accessControlListItem.domainObjectId;
                    vm.selectedRole = vm.accessControlListItem.roleId;
                }, function (error) {
                    logError('Unable to get AccessControlListItem ' + val);
                    goToAccessControlListItems();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.accessControlListItem.id);
                if (vm.accessControlListItem.entityAspect.entityState.isDetached()) {
                    goToAccessControlListItems();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAccessControlListItems() {
            $location.path('/accessControlListItems');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
            vm.accessControlListItem.domainObjectId = vm.selectedDomainObject;

            vm.accessControlListItem.roleId = vm.selectedRole;

            // Save Changes
            return datacontext.save("SaveAccessControlListItems")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.accessControlListItem,
                                        vm.actionType != 'D' ? vm.originalAccessControlListItem : cloneAccessControlListItem(vm.accessControlListItem),
                                        vm.actionType != 'D' ? cloneAccessControlListItem(vm.accessControlListItem) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                        urlHelper.replaceLocationUrlGuidWithId(vm.accessControlListItem.id);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function selectedDomainObjectChanged() {
            if (vm.selectedDomainObject != vm.accessControlListItem.domainObjectId) {
                vm.hasChanges = true;
            }
        }

        function selectedRoleChanged() {
            if (vm.selectedRole != vm.accessControlListItem.roleId) {
                vm.hasChanges = true;
            }
        }

        function permissionChanged(permissionText) {

            // Reset permission to 0
            vm.accessControlListItem.permissionValue = 0;

            if (($("#readCheckBox").is(':checked') && $("#readCheckBox").val() == permissionText)
                || ($("#readCheckBox").parent().hasClass('checked') && $("#readCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.readPermission.value;
            }

            if (($("#writeCheckBox").is(':checked') && $("#writeCheckBox").val() == permissionText)
                || ($("#writeCheckBox").parent().hasClass('checked') && $("#writeCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.writePermission.value;
            }

            if (($("#deleteCheckBox").is(':checked') && $("#deleteCheckBox").val() == permissionText)
                || ($("#deleteCheckBox").parent().hasClass('checked') && $("#deleteCheckBox").val() != permissionText)) {
                vm.accessControlListItem.permissionValue += vm.deletePermission.value;
            }
        }

        function deleteAccessControlListItem() {
            return bsDialog.deleteDialog('AccessControlListItem')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.accessControlListItem);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    if (!vm.isModal) {
                        goToAccessControlListItems();
                    }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;

            // Domain Objects lookup list
            vm.domainObjects = lookups.domainObjects;
            if (vm.accessControlListItem !== undefined) {
                vm.selectedDomainObject = vm.accessControlListItem.domainObjectId;
            }

            // Roles lookup list
            vm.roles = lookups.roles;
            if (vm.accessControlListItem !== undefined) {
                vm.selectedRole = vm.accessControlListItem.roleId;
            }

            // Permissions lookup list
            vm.permissions = lookups.permissions;
            for (var i = 0; i < vm.permissions.length; i++) {
                if (vm.permissions[i].description == "Read") {
                    vm.readPermission = vm.permissions[i];
                }

                if (vm.permissions[i].description == "Write") {
                    vm.writePermission = vm.permissions[i];
                }

                if (vm.permissions[i].description == "Delete") {
                    vm.deletePermission = vm.permissions[i];
                }
            }

            setPermissions();
        }

        function setPermissions() {
            if (vm.accessControlListItem !== undefined) {
                if ((vm.accessControlListItem.permissionValue & vm.readPermission.value) == vm.readPermission.value) {
                    $("#readCheckBox").parent().addClass('checked');
                    $("#readCheckBox").prop('checked', true);
                }

                if ((vm.accessControlListItem.permissionValue & vm.writePermission.value) == vm.writePermission.value) {
                    $("#writeCheckBox").parent().addClass('checked');
                    $("#writeCheckBox").prop('checked', true);
                }

                if ((vm.accessControlListItem.permissionValue & vm.deletePermission.value) == vm.deletePermission.value) {
                    $("#deleteCheckBox").parent().addClass('checked');
                    $("#deleteCheckBox").prop('checked', true);
                }
            }
        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.accessControlListItem) { return; }
            var description = vm.accessControlListItem.name || '[New AccessControlListItem] id: ' + vm.accessControlListItem.id; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.accessControlListItem, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function cloneAccessControlListItem(accessControlListItem) {
            return {
                Id: accessControlListItem.id,
                DomainObjectId: accessControlListItem.domainObjectId,
                RoleId: accessControlListItem.roleId,
                PermissionValue: accessControlListItem.permissionValue,
                IsActive: accessControlListItem.isActive,
                CreatedDate: accessControlListItem.createdDate,
                CreatedBy: accessControlListItem.createdBy,
                UpdatedDate: accessControlListItem.updatedDate,
                UpdatedBy: accessControlListItem.updatedBy,
            };
        }
        // #endregion
        // #region Modal Dialog
        function addDomainObject() {
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/domainObject/domainObjectItem.html',
                controller: 'domainObjectItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newDomainObject) {

                if (newDomainObject) {
                    vm.domainObjects.push(newDomainObject);
                    vm.selectedDomainObject = vm.domainObjects[vm.domainObjects.length - 1].domainObjectId;
                    vm.accessControlListItem.domainObjectId = vm.selectedDomainObject;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };
        function addRole() {
            var modalScope = $rootScope.$new();
            // passing parameter into modal view
            modalScope.isModal = true;
            modalScope.modalInstance = $modal.open({
                templateUrl: '/app/features/role/roleItem.html',
                controller: 'roleItemController as vm',
                size: 'lg',
                scope: modalScope, // <- This is it!
                //resolve: {
                //    isModal: true
                //}
            });

            modalScope.modalInstance.result.then(function (newRole) {

                if (newRole) {
                    vm.roles.push(newRole);
                    vm.selectedRole = vm.roles[vm.roles.length - 1].roleId;
                    vm.accessControlListItem.roleId = vm.selectedRole;
                    vm.isSaving = false;
                    vm.hasChanges = true;
                }

            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };
        // #endregion
    }
    // #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'aspNetRoleListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, AspNetRoleListController);

	// 2. Inject dependencies
	AspNetRoleListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function AspNetRoleListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.aspNetRoles = [];
		vm.aspNetRoleCount = 0;
		vm.aspNetRoleFilteredCount = 0;
		vm.aspNetRoleSearch = '';

		vm.title = 'AspNetRoles';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToAspNetRole = goToAspNetRole;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.aspNetRoleFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Name']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.aspNetRolesServer = [];
        vm.aspNetRolesServerFilter = [];
        vm.aspNetRoleCountServer = 0;
        vm.aspNetRoleFilteredCountServer = 0;
        vm.aspNetRoleServerSearch = '';
        vm.setAspNetRolesServerFilter = setAspNetRolesServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.aspNetRoleFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'name',
			orderDesc: ''
		};

      
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getAspNetRoles() 
                                       ,getAspNetRolesServer()

], controllerId)
				.then(function () { log('Activated AspNetRoles View.'); });
		}


		function getAspNetRoles(forceRefresh) {
			return datacontext.aspNetRole.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.aspNetRoleSearch)
				.then(function (data) {
					vm.aspNetRoles = data;
					
                    if (!vm.aspNetRoleCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getAspNetRoleCount();
					}
					getAspNetRoleFilteredCount();
					return data;
				}
			);
		}

		function getAspNetRolesServer(forceRefresh) {
            return datacontext.aspNetRole.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.aspNetRoleServerSearch)
                .then(function(data) {
                    vm.aspNetRolesServerFilter = data;

                    if (!vm.aspNetRoleFilteredCountServer || forceRefresh) {
                        getAspNetRoleCountServer();
                    }

                    getAspNetRoleFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getAspNetRoleCount() {
			return datacontext.aspNetRole.getCount().then(function (data) {
				return vm.aspNetRoleCount = data;
			});
		}

		function getAspNetRoleFilteredCount() {
            vm.aspNetRoleFilteredCount = datacontext.aspNetRole.getFilteredCount(vm.aspNetRoleSearch);
		}

		function getAspNetRoleCountServer() {
            return datacontext.aspNetRole.getCount().then(function (data) {
                return vm.aspNetRoleCountServer = data;
            });
        }

        function getAspNetRoleFilteredCountServer() {
            datacontext.aspNetRole.getFilteredCountServer(vm.aspNetRoleServerSearch)
                .then(function(count) {
                    vm.aspNetRoleFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getAspNetRoles();
		}

		function pageChangedServer() {
            getAspNetRolesServer();
        }

		function refresh() { getAspNetRoles(true); }
		function refreshServer() { getAspNetRolesServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.aspNetRoleSearch = ''; }
			getAspNetRoles();
		}

		function searchServer() {
            return getAspNetRolesServer();
        }

        function setAspNetRolesServerFilter(aspNetRole) {
            var textContains = common.textContains;
            var searchText = vm.aspNetRolesServerSearch;

            var isMatch = searchText
                ? textContains(aspNetRole.name, searchText)
                || textContains(aspNetRole.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getAspNetRoles();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getAspNetRolesServer();
        }
		// #endregion

        function goToAspNetRole(aspNetRole) {
		    if (aspNetRole && aspNetRole.id) {
		        $location.path('/role/' + aspNetRole.id);
			}
		}

		// #endregion
	}
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'aspNetRoleItemController';

	// 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, AspNetRoleItemController);

	// 2. Inject dependencies
	AspNetRoleItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// #region 3. Define controller
    function AspNetRoleItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.aspNetRole;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Define bindable variables to the view
		vm.activate = activate;
        vm.aspNetRole = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalAspNetRole = null;

		
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteAspNetRole = deleteAspNetRole;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

		// For DateTime fields
			
		
        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
    			// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
			            common.activateController([getRequestedAspNetRole()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedAspNetRole() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetRole = datacontext.aspNetRole.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.aspNetRole = datacontext.aspNetRole.create();
            }

            return datacontext.aspNetRole.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalAspNetRole = cloneAspNetRole(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.aspNetRole = data.entity || data;
	                }, function (error) {
                    logError('Unable to get AspNetRole ' + val);
                    goToAspNetRoles();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.aspNetRole.id);
            if (vm.aspNetRole.entityAspect.entityState.isDetached()) {
                goToAspNetRoles();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToAspNetRoles() {
            $location.path('/aspNetRoles');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }
		
        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
	
			// Save Changes
            return datacontext.save("SaveAspNetRoles")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.aspNetRole,
                                        vm.actionType != 'D' ? vm.originalAspNetRole : cloneAspNetRole(vm.aspNetRole),
                                        vm.actionType != 'D' ? cloneAspNetRole(vm.aspNetRole) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                        urlHelper.replaceLocationUrlGuidWithId(vm.aspNetRole.id);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;                    
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteAspNetRole() {
            return bsDialog.deleteDialog('AspNetRole')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.aspNetRole);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToAspNetRoles();
                }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

				function initLookups() {
				var lookups = datacontext.lookup.lookupCachedData;
	        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.aspNetRole) { return; }
            var description = vm.aspNetRole.name || '[New AspNetRole] id: ' + vm.aspNetRole.id; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.aspNetRole, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function cloneAspNetRole(aspNetRole) {
            return {
		            Id: aspNetRole.id,
		            Name: aspNetRole.name,
		        };
        }
		// #endregion
    }
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'domainObjectListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, DomainObjectListController);

	// 2. Inject dependencies
	DomainObjectListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function DomainObjectListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.domainObjects = [];
		vm.domainObjectCount = 0;
		vm.domainObjectFilteredCount = 0;
		vm.domainObjectSearch = '';

		vm.title = 'DomainObjects';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToDomainObject = goToDomainObject;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.domainObjectFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Name','Description']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.domainObjectsServer = [];
        vm.domainObjectsServerFilter = [];
        vm.domainObjectCountServer = 0;
        vm.domainObjectFilteredCountServer = 0;
        vm.domainObjectServerSearch = '';
        vm.setDomainObjectsServerFilter = setDomainObjectsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.domainObjectFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'name',
			orderDesc: ''
		};

      
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getDomainObjects() 
                                       ,getDomainObjectsServer()

], controllerId)
				.then(function () { log('Activated DomainObjects View.'); });
		}


		function getDomainObjects(forceRefresh) {
			return datacontext.domainObject.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.domainObjectSearch)
				.then(function (data) {
					vm.domainObjects = data;
					
                    if (!vm.domainObjectCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getDomainObjectCount();
					}
					getDomainObjectFilteredCount();
					return data;
				}
			);
		}

		function getDomainObjectsServer(forceRefresh) {
            return datacontext.domainObject.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.domainObjectServerSearch)
                .then(function(data) {
                    vm.domainObjectsServerFilter = data;

                    if (!vm.domainObjectFilteredCountServer || forceRefresh) {
                        getDomainObjectCountServer();
                    }

                    getDomainObjectFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getDomainObjectCount() {
			return datacontext.domainObject.getCount().then(function (data) {
				return vm.domainObjectCount = data;
			});
		}

		function getDomainObjectFilteredCount() {
            vm.domainObjectFilteredCount = datacontext.domainObject.getFilteredCount(vm.domainObjectSearch);
		}

		function getDomainObjectCountServer() {
            return datacontext.domainObject.getCount().then(function (data) {
                return vm.domainObjectCountServer = data;
            });
        }

        function getDomainObjectFilteredCountServer() {
            datacontext.domainObject.getFilteredCountServer(vm.domainObjectServerSearch)
                .then(function(count) {
                    vm.domainObjectFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getDomainObjects();
		}

		function pageChangedServer() {
            getDomainObjectsServer();
        }

		function refresh() { getDomainObjects(true); }
		function refreshServer() { getDomainObjectsServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.domainObjectSearch = ''; }
			getDomainObjects();
		}

		function searchServer() {
            return getDomainObjectsServer();
        }

        function setDomainObjectsServerFilter(domainObject) {
            var textContains = common.textContains;
            var searchText = vm.domainObjectsServerSearch;

            var isMatch = searchText
                ? textContains(domainObject.name, searchText)
                || textContains(domainObject.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getDomainObjects();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getDomainObjectsServer();
        }
		// #endregion

		function goToDomainObject(domainObject) {
		    if (domainObject && domainObject.id) {
		        $location.path('/domainObject/' + domainObject.id);
			}
		}




		// #endregion
	}
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'domainObjectItemController';

	// 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, DomainObjectItemController);

	// 2. Inject dependencies
	DomainObjectItemController.$inject = ['$location', '$stateParams','$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
	// #region 3. Define controller
    function DomainObjectItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

		// #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.domainObject;
        var wipEntityKey = undefined;
		// #endregion

        // #region 3.2. Define bindable variables to the view
		vm.activate = activate;
        vm.domainObject = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalDomainObject = null;

		
        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteDomainObject = deleteDomainObject;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

		// For DateTime fields
			
		
        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
    			// #endregion

		// 3.3. Run activate method
        activate();

		// #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
			            common.activateController([getRequestedDomainObject()], controllerId)
                .then(onEveryChange());
        }

        function getRequestedDomainObject() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.domainObject = datacontext.domainObject.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.domainObject = datacontext.domainObject.create();
            }

            return datacontext.domainObject.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalDomainObject = cloneDomainObject(data);
                    
					// If get data from WIP, need to use data.entity, otherwise use data.
					wipEntityKey = data.key;
                    vm.domainObject = data.entity || data;
	                }, function (error) {
                    logError('Unable to get DomainObject ' + val);
                    goToDomainObjects();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.domainObject.id);
            if (vm.domainObject.entityAspect.entityState.isDetached()) {
                goToDomainObjects();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToDomainObjects() {
            $location.path('/domainObjects');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }
		
        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;
	
			// Save Changes
            return datacontext.save("SaveDomainObjects")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.domainObject,
                                        vm.actionType != 'D' ? vm.originalDomainObject : cloneDomainObject(vm.domainObject),
                                        vm.actionType != 'D' ? cloneDomainObject(vm.domainObject) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                        urlHelper.replaceLocationUrlGuidWithId(vm.domainObject.id);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;                    
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function deleteDomainObject() {
            return bsDialog.deleteDialog('DomainObject')
                .then(confirmDelete);

            function confirmDelete() {
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.domainObject);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                if (!vm.isModal) {
                    goToDomainObjects();
                }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

				function initLookups() {
				var lookups = datacontext.lookup.lookupCachedData;
	        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.domainObject) { return; }
            var description = vm.domainObject.name || '[New DomainObject] id: ' + vm.domainObject.id; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.domainObject, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function cloneDomainObject(domainObject) {
            return {
		            Id: domainObject.id,
		            Name: domainObject.name,
		            Description: domainObject.description,
		            IsActive: domainObject.isActive,
		            CreatedDate: domainObject.createdDate,
		            CreatedBy: domainObject.createdBy,
		            UpdatedDate: domainObject.updatedDate,
		            UpdatedBy: domainObject.updatedBy,
		        };
        }
		// #endregion
    }
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
	'use strict';

	var controllerId = 'permissionListController';

	// 1. Get 'app' module and define controller
	angular
		.module('app.features')
		.controller(controllerId, PermissionListController);

	// 2. Inject dependencies
	PermissionListController.$inject = ['$location', 'common', 'config', 'datacontext'];

	// #region 3. Define controller
	function PermissionListController($location, common, config, datacontext) {
		
		// #region 3.1. Define functions
		var getLogFn = common.logger.getLogFn;
		var log = getLogFn(controllerId);
		var keyCodes = config.keyCodes;

		var vm = this;
		// #endregion

		// #region 3.2. Define bindable variables to the view
		// #region Breeze client-side cached
		vm.permissions = [];
		vm.permissionCount = 0;
		vm.permissionFilteredCount = 0;
		vm.permissionSearch = '';

		vm.title = 'Permissions';
		vm.refresh = refresh;
		vm.search = search;
		vm.goToPermission = goToPermission;

		vm.paging = {
			currentPage: 1,
            currentPageServer: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChanged = pageChanged;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.permissionFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSort = setSort;
		vm.theads = ['Value','Name','Description']; // Table headers
		vm.sorting = {
			orderBy: 'name',
			orderDesc: ''
		};
		// #endregion

        // #region server-side remote acess
        
        vm.permissionsServer = [];
        vm.permissionsServerFilter = [];
        vm.permissionCountServer = 0;
        vm.permissionFilteredCountServer = 0;
        vm.permissionServerSearch = '';
        vm.setPermissionsServerFilter = setPermissionsServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.permissionFilteredCountServer / vm.paging.pageSize) + 1;
            }
        });

        vm.setSortServer = setSortServer;
        vm.sortingServer = {
			orderBy: 'name',
			orderDesc: ''
		};

      
        // #endregion
		// #endregion

		// 3.3. Run activate method
		activate();

		// #region 3.4. Controller functions implementation
		function activate() {
			common.activateController([getPermissions() 
                                       ,getPermissionsServer()

], controllerId)
				.then(function () { log('Activated Permissions View.'); });
		}


		function getPermissions(forceRefresh) {
			return datacontext.permission.getAll(
                    forceRefresh,
                    vm.sorting.orderBy,
                    vm.sorting.orderDesc,
				    vm.paging.currentPage,
                    vm.paging.pageSize,
                    vm.permissionSearch)
				.then(function (data) {
					vm.permissions = data;
					
                    if (!vm.permissionCount || forceRefresh) {
						// Only grab the full count once or on refresh
						getPermissionCount();
					}
					getPermissionFilteredCount();
					return data;
				}
			);
		}

		function getPermissionsServer(forceRefresh) {
            return datacontext.permission.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.permissionServerSearch)
                .then(function(data) {
                    vm.permissionsServerFilter = data;

                    if (!vm.permissionFilteredCountServer || forceRefresh) {
                        getPermissionCountServer();
                    }

                    getPermissionFilteredCountServer();

                    return data;
                });
        }

		// #region Get Counts
		function getPermissionCount() {
			return datacontext.permission.getCount().then(function (data) {
				return vm.permissionCount = data;
			});
		}

		function getPermissionFilteredCount() {
            vm.permissionFilteredCount = datacontext.permission.getFilteredCount(vm.permissionSearch);
		}

		function getPermissionCountServer() {
            return datacontext.permission.getCount().then(function (data) {
                return vm.permissionCountServer = data;
            });
        }

        function getPermissionFilteredCountServer() {
            datacontext.permission.getFilteredCountServer(vm.permissionServerSearch)
                .then(function(count) {
                    vm.permissionFilteredCountServer = count;
                });
        }
		// #endregion

		// #region Paging/Sorting/Filtering
		function pageChanged() {
			getPermissions();
		}

		function pageChangedServer() {
            getPermissionsServer();
        }

		function refresh() { getPermissions(true); }
		function refreshServer() { getPermissionsServer(true); }

		function search($event) {
			if ($event.keyCode === keyCodes.esc) { vm.permissionSearch = ''; }
			getPermissions();
		}

		function searchServer() {
            return getPermissionsServer();
        }

        function setPermissionsServerFilter(permission) {
            var textContains = common.textContains;
            var searchText = vm.permissionsServerSearch;

            var isMatch = searchText
                ? textContains(permission.name, searchText)
                || textContains(permission.abbreviation, searchText)
                : true;
            return isMatch;
        }

        function setSort(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sorting.orderBy = field;
            if (vm.sorting.orderDesc == '') { vm.sorting.orderDesc = 'desc'; }
            else { vm.sorting.orderDesc = ''; }

            getPermissions();
        }

        function setSortServer(field) {
            field = common.lowerCaseFirstLetter(field);
            field = common.replaceSpecialCharacters(field, ' ');

            vm.sortingServer.orderBy = field;
            if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
            else { vm.sortingServer.orderDesc = ''; }

            return getPermissionsServer();
        }
		// #endregion

		function goToPermission(permission) {
		    if (permission && permission.id) {
		        $location.path('/permission/' + permission.id);
			}
		}




		// #endregion
	}
	// #endregion
})();


// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'permissionItemController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, PermissionItemController);

    // 2. Inject dependencies
    PermissionItemController.$inject = ['$location', '$stateParams', '$rootScope', '$scope', '$window', '$modal',
            'bootstrap.dialog', 'common', 'config', 'commonConfig', 'datePickerConfig', 'model', 'datacontext', 'urlHelper'];
    // #region 3. Define controller
    function PermissionItemController($location, $stateParams, $rootScope, $scope, $window, $modal,
        bsDialog, common, config, commonConfig, datePickerConfig, model, datacontext, urlHelper) {

        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        var entityName = model.entityNames.permission;
        var wipEntityKey = undefined;
        // #endregion

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        vm.permission = undefined;

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalPermission = null;


        vm.goBack = goBack;
        vm.cancel = cancel;
        vm.save = save;
        vm.deletePermission = deletePermission;
        vm.hasChanges = false;
        vm.isSaving = false;
        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        // For DateTime fields


        // For modal dialog
        vm.isModal = false;
        if ($scope.isModal) {
            vm.isModal = $scope.isModal;
        }
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedPermission()], controllerId)
    .then(onEveryChange());
        }

        function getRequestedPermission() {
            if (vm.isModal) {
                vm.actionType = 'I'; // For audit log
                return vm.permission = datacontext.permission.create();
            }

            var val = $stateParams.id;

            if (val === 'new') {
                vm.actionType = 'I'; // For audit log
                return vm.permission = datacontext.permission.create();
            }

            return datacontext.permission.getEntityByIdOrFromWip(val)
                .then(function (data) {
                    vm.actionType = 'U'; // For audit log
                    vm.originalPermission = clonePermission(data);

                    // If get data from WIP, need to use data.entity, otherwise use data.
                    wipEntityKey = data.key;
                    vm.permission = data.entity || data;
                }, function (error) {
                    logError('Unable to get Permission ' + val);
                    goToPermissions();
                });
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            if (!vm.isModal) {
                $window.history.back();
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (!vm.isModal) {
                urlHelper.replaceLocationUrlGuidWithId(vm.permission.id);
                if (vm.permission.entityAspect.entityState.isDetached()) {
                    goToPermissions();
                }
            }
            else {
                $scope.modalInstance.dismiss('cancel');
            }
        }

        function goToPermissions() {
            $location.path('/permissions');
        }

        function onDestroy() {
            // $on listens events of a given type
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function canSave() {
            return (vm.hasChanges && !vm.isSaving);
        }

        function save() {
            vm.isSaving = true;

            // Save Changes
            return datacontext.save("SavePermissions")
                .then(function (saveResult) {
                    vm.isSaving = false;

                    // Save Audit Log
                    common.$broadcast(commonConfig.config.userActionAddedEvent, vm.actionType, model.controllerNames.permission,
                                        vm.actionType != 'D' ? vm.originalPermission : clonePermission(vm.permission),
                                        vm.actionType != 'D' ? clonePermission(vm.permission) : null);

                    removeWipEntity();
                    if (!vm.isModal) {
                        urlHelper.replaceLocationUrlGuidWithId(vm.permission.id);
                    }
                    else {
                        $scope.modalInstance.close(vm.hospital);
                    }
                }, function (error) {
                    vm.isSaving = false;
                });
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
                vm.actionType = 'D'; // For Audit Log
                datacontext.markDeleted(vm.permission);
                vm.save().then(success).catch(failed);

                function success() {
                    removeWipEntity();
                    if (!vm.isModal) {
                        goToPermissions();
                    }
                    else {
                        $scope.modalInstance.dismiss('cancel');
                    }
                }

                function failed(error) { cancel(); }
            }
        }
        //#endregion

        function initLookups() {
            var lookups = datacontext.lookup.lookupCachedData;
        }

        //#region Work in progress
        function storeWipEntity() {
            if (!vm.permission) { return; }
            var description = vm.permission.name || '[New Permission] id: ' + vm.permission.id; // Need to change "name" to a main property that we want to show to user

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(
                vm.permission, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged,
                function (event, data) { autoStoreWip(); }
            );
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }
        //#endregion

        function clonePermission(permission) {
            return {
                Id: permission.id,
                Value: permission.value,
                Name: permission.name,
                Description: permission.description,
                IsActive: permission.isActive,
                CreatedDate: permission.createdDate,
                CreatedBy: permission.createdBy,
                UpdatedDate: permission.updatedDate,
                UpdatedBy: permission.updatedBy,
            };
        }
        // #endregion
    }
    // #endregion
})();


(function () {
    'use strict';

    var controllerID = "PaymentController";

    angular
        .module('app.features')
        .controller(controllerID, paymentController);

    paymentController.$inject = ['$scope', 'common', 'commonConfig', 'config'];

    function paymentController($scope, common, commonConfig, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerID, 'error');
        var log = getLogFn(controllerID);

        vm.activate = activate;

        activate();

        function activate() {
            common.activateController(controllerID)
                .then(function () { log('Activated Payment View.'); });
        }

        $scope.onSubmit = function () {
        };

        $scope.stripeCallback = function (status, response) {

            if (response.error) {
                // there was an error. Fix it.
            } else {
                // got stripe token, now charge it or smt
                window.alert('success! token: ' + response.id);
            }
        };
    }
})();
(function () {
    'use strict';

    var controllerID = "SubscriptionController";

    angular
        .module('app.features')
        .controller(controllerID, paymentController);

    paymentController.$inject = ['$scope', '$location', 'common', 'commonConfig', 'config', 'authService', 'accountService'];

    function paymentController($scope, $location, common, commonConfig, config, authService, accountService) {

        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var logError = getLogFn(controllerID, 'error');
        var log = getLogFn(controllerID);

        vm.account = {
            userName: '',
            id: '',
            email: '',
            phoneNumber: ''
        };
        vm.authentication = authService.authentication;
        vm.plans = [];
        vm.logins = [];
        vm.stripeCustomerInfos = {
            currentSubscriptionPlanId: '',
            hasCreditCard: false,
            hasStripeRegistered: false
        };
        vm.subscribe = subscribe;
        vm.checkCurrentSubscription = checkCurrentSubscription;

        //vm.externalProviders = ['Facebook', 'Google', 'LinkedIn', 'Microsoft', 'Twitter', 'Yahoo'];
        vm.externalProviders = ['Facebook', 'Google'];

        vm.activate = activate;

        activate();

        function activate() {
            if (!vm.authentication.isAuth) {
                $location.path('/login');
            }

            common.activateController([getPlans(), getStripeCustomerInfos()], controllerID)
                .then(function () { log('Activated Subscription View.'); });
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
                vm.stripe = data.stripe;
            }

            function failed(response) {
                logError('Retrieved user information failed: ' + response.message + '.');
            }
        }

        function getPlans() {
            return accountService.getStripePlans()
				.then(function (response) {
                    vm.plans = response.data.plans;
				}
			);
        }

        function getStripeCustomerInfos() {
            return accountService.getStripeCustomerInfos().then(function (response) {
                var data = response.data;

                if (data == null || data == 'null') {
                    authService.logout();
                    return $location.path('/login');
                }

                vm.stripeCustomerInfos = data;
            });
        }

        function checkCurrentSubscription(planId) {
            return planId == vm.stripeCustomerInfos.currentSubscriptionPlanID;
        }

        function subscribe(planId) {

            if (!vm.stripeCustomerInfos.hasCreditCard) {
                // navigate to RegisterStripe view for adding new Card
                return $location.path('/addCard/' + planId);
            }

            var subscription = {
                newPlanID: planId
            };

            accountService.updateSubscription(subscription).then(function(response) {
                var data = response.data;

                if (data == null || data == 'null') {
                    authService.logout();
                    return $location.path('/login');
                }

                // refresh stripe customer infos (included new subscription-plan)
                vm.stripeCustomerInfos = data;
            }).catch(function(error) {
                log(error);
            });
        }
    }
})();
// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'ManagePaymentController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, managePaymentController);

    // 2. Inject dependencies
    managePaymentController.$inject = ['$location', 'common', 'config', 'authService', 'accountService'];

    // #region 3. Define controller
    function managePaymentController($location, common, config, authService, accountService) {

        // #region 3.1. Define functions
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var vm = this;
        vm.authentication = authService.authentication;

        // #endregion

        // #region 3.2. Define bindable variables to the view
        // #region Breeze client-side cached
        vm.cards = [];

        vm.title = 'cards';
        vm.goTocard = goTocard;
        vm.theads = ['Last4']; // Table headers
        // #endregion

        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            // Log-in Required
            if (!vm.authentication.isAuth) {
                return $location.path('/login');
            }

            common.activateController([getcards()], controllerId)
				.then(function () { log('Activated Cards View.'); });
        }

        function getcards() {
            return accountService.getUserCards()
				.then(function (response) {
				    vm.cards = response.data;
				}
			);
        }

        function goTocard(card) {
            if (card && card.id) {
                $location.path('/addCard/' + card.id);
            }
        }




        // #endregion
    }
    // #endregion
})();
// 0. IIFE (Immediately-invoked function expression)
(function () {
    'use strict';

    var controllerId = 'AddCardController';

    // 1. Get 'app' module and define controller
    angular
		.module('app.features')
		.controller(controllerId, addCardController);

    // 2. Inject dependencies
    addCardController.$inject = ['$scope', '$location', '$stateParams', '$rootScope', '$window', 'common', 'accountService'];
    // #region 3. Define controller
    function addCardController($scope, $location, $stateParams, $rootScope, $window, common, accountService) {
        $scope.addNewCard = $stateParams.id === 'new';
        $scope.setAsDefault = false;

        $scope.stripeCallback = function (code, result) {

            if (result.error) {
                logError('Stripe returns an error when trying to validate your card. code: ' + code + ' - ' + result.error.message);
            } else {
                var cardToken = {
                    setAsDefaultCard: $scope.setAsDefault,
                    token: result.id
                };

                if ($scope.addNewCard) {

                    // add new payment information (credit-card) for user.
                    accountService.addUserCard(cardToken).then(function (response) {
                        $location.path('/payment');
                    });
                } else {
                    var subscription = {
                        token: result.id,
                        newPlanID: $stateParams.id
                    };

                    // user enter his/her card to upgrade their subscription. 
                    accountService.updateSubscription(subscription).then(function (response) {
                        $location.path('/subscription');
                    });
                }
            }
        }


        // #region 3.1. Define functions
        var vm = this;
        var logError = common.logger.getLogFn(controllerId, 'error');
        // #endregion

        

        // #region 3.2. Define bindable variables to the view
        vm.activate = activate;
        

        // For audit log
        vm.actionType = ''; // I: Insert || U: Update || D: Delete
        vm.originalcard = null;


        vm.goBack = goBack;
        vm.delete = deleteCard;
        vm.stripeCallback = stripeCallback;
        // #endregion

        // 3.3. Run activate method
        activate();

        // #region 3.4. Controller functions implementation
        function activate() {
            common.activateController([], controllerId)
                .then();
        }

        //#region Back - Save - Cancel - Delete
        function goBack() {
            $window.history.back();
        }

        function stripeCallback(code, result) {
            
        }

        function goTocards() {
            $location.path('/payment');
        }

        function deleteCard() {
        }
        //#endregion
    }
    // #endregion
})();


