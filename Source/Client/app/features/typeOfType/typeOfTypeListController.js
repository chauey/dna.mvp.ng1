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
        vm.goToTypeOfType = goToTypeOfType;

        vm.paging = {
            currentPage: 1,
            currentPageServer: 1,
            maxPagesToShow: 5,
            pageSize: 15
        };

        vm.theads = ['Abbreviation', 'Name', 'Created Date']; // Table headers

        // #endregion

        // #region server-side remote acess

        vm.typeOfTypesServer = [];
        vm.typeOfTypesServerFilter = [];
        vm.typeOfTypeCountServer = 0;
        vm.filteredCount = 0;
        vm.typeOfTypeServerSearch = '';
        vm.setTypeOfTypesServerFilter = setTypeOfTypesServerFilter;

        vm.refreshServer = refreshServer;
        vm.searchServer = searchServer;

        vm.pageChangedServer = pageChangedServer;
        Object.defineProperty(vm.paging, 'pageCountServer', {
            get: function () {
                return Math.floor(vm.filteredCount / vm.paging.pageSize) + 1;
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
            common.activateController([
                getTypeOfTypesServer(),
                getParents(),
                getTypes()
            ], controllerId)
				.then(function () {
				    log('Activated TypeOfTypes View.');

				    // init data-table
				    //TableAdvanced.init();
				    //TableAdvanced.initServer();
				});
        }

        function getParents() {
            // get all parent types
            var query = "$orderby=name&$filter=parentID eq null or parentID eq " + common.emptyGuid;
            datacontext.typeOfType.getAllWithoutPaging(query).then(function (response) {
                vm.parent = response.data.value;
            });
        }
        function getTypes() {
            // get all types
            var query = "$orderby=name";
            datacontext.typeOfType.getAllWithoutPaging(query).then(function (response) {
                vm.types = response.data.value;
            });
        }

        function getTypeOfTypesServer(forceRefresh) {
            return datacontext.typeOfType.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.typeOfTypeServerSearch)
                .then(function (data) {
                    vm.typeOfTypesServerFilter = data;

                    if (!vm.filteredCount || forceRefresh) {
                        getTypeOfTypeCountServer();
                    }

                    getTypeOfTypeFilteredCountServer();

                    return data;
                });
        }

        // #region Get Counts

        function getTypeOfTypeCountServer() {
            return datacontext.typeOfType.getCount().then(function (data) {
                return vm.typeOfTypeCountServer = data;
            });
        }

        function getTypeOfTypeFilteredCountServer() {
            datacontext.typeOfType.getFilteredCountServer(vm.typeOfTypeServerSearch)
                .then(function (count) {
                    vm.filteredCount = count;
                });
        }
        // #endregion

        // #region Paging/Sorting/Filtering

        function pageChangedServer() {
            getTypeOfTypesServer();
        }

        function refreshServer() {
            getTypeOfTypesServer(true);
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

        vm.onParentServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedParentServer != null) {
                datacontext.typeOfType.getAllByParent(vm.selectedParentServer.typeOfTypeID)
                .then(function (response) {
                    vm.typeOfTypesServerFilter = response.data.value;
                    vm.typeOfTypeFilteredCountServer = response.data.value.length;
                });
            }
            else {
                getTypeOfTypesServer(true);
            }
        }

        vm.onTypeServerSelectionChange = function () {
            // get all Patients (from local) by Hospital ID.
            if (vm.selectedTypeServer != null) {
                datacontext.typeOfType.getAllByType(vm.selectedTypeServer.typeOfTypeID)
                .then(function (response) {
                    vm.typeOfTypesServerFilter = response.data.value;
                    vm.typeOfTypeFilteredCountServer = response.data.value.length;
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