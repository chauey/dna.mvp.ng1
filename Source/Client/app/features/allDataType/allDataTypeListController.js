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
		vm.allDataTypesServer = [];
		vm.allDataTypesServerFilter = [];
		vm.allDataTypeCountServer = 0;
		vm.allDataTypeFilteredCountServer = 0;
		vm.allDataTypeServerSearch = '';
		vm.setAllDataTypesServerFilter = setAllDataTypesServerFilter;

		vm.title = 'AllDataTypes';
		vm.refreshServer = refreshServer;
		vm.searchServer = searchServer;
		vm.goToAllDataType = goToAllDataType;

		vm.paging = {
			currentPage: 1,
			maxPagesToShow: 5,
			pageSize: 15
		};
		vm.pageChangedServer = pageChangedServer;
		Object.defineProperty(vm.paging, 'pageCount', {
			get: function () {
				return Math.floor(vm.allDataTypeFilteredCount / vm.paging.pageSize) + 1;
			}
		});

		vm.setSortServer = setSortServer;
		vm.theads = ['BigInt','Binary','Bit','Char','Date','DateTime','DateTime2','DateTimeOffset','Decimal','Float','Geography','Geometry','Image','Int','Money','NChar','NText','Numeric','NVarChar','NVarCharMax','Real','SmallDateTime','SmallInt','SmallMoney','Text','Time','TimeStamp','TinyInt','UniqueIdentifier','VarBinary','VarBinaryMax','VarChar','VarCharMax','Xml','ZSql_Variant']; // TODO: DONE - ADD TABLE HEADERS HERE
		vm.sortingServer = {
			orderBy: 'bigInt',
			orderDesc: ''
		};
	    // #endregion

	    // 3.3. Run activate method
		activate();

	    // #region 3.4. Controller functions implementation
		function activate() {
		    common.activateController([getAllDataTypesServer()], controllerId)
				.then(function () { log('Activated AllDataTypes View.'); });
		}

		function getAllDataTypesServer(forceRefresh) {
		    return datacontext.allDataType.getAllServer(
                    forceRefresh,
                    vm.sortingServer.orderBy,
                    vm.sortingServer.orderDesc,
                    vm.paging.currentPageServer,
                    vm.paging.pageSize,
                    vm.allDataTypeServerSearch)
                .then(function (data) {
                    vm.allDataTypesServerFilter = data;

                    if (!vm.allDataTypeFilteredCountServer || forceRefresh) {
                        getAllDataTypeCountServer();
                    }

                    getAllDataTypeFilteredCountServer();

                    return data;
                });
		}

	    // #region Get Counts
		function getAllDataTypeCountServer() {
		    datacontext.allDataType.getCount()
                  .then(function (count) {
                      vm.allDataTypeCountServer = count;
                  });
		}
		function getAllDataTypeFilteredCountServer() {
		    datacontext.allDataType.getFilteredCountServer(vm.allDataTypeServerSearch)
                .then(function (count) {
                    vm.allDataTypeFilteredCountServer = count;
                });
		}
	    // #endregion

	    // #region Paging/Sorting/Filtering

		function pageChangedServer() {
		    getAllDataTypesServer();
		}

		function refreshServer() { getAllDataTypesServer(true); }

		function searchServer() {
		    return getAllDataTypesServer();
		}

		function setAllDataTypesServerFilter(allDataType) {
		    var textContains = common.textContains;
		    var searchText = vm.allDataTypesServerSearch;

		    var isMatch = searchText
                ? textContains(allDataType.id, searchText)
                || textContains(allDataType.abbreviation, searchText)
                : true;
		    return isMatch;
		}

		function setSortServer(field) {
		    field = common.lowerCaseFirstLetter(field);
		    field = common.replaceSpecialCharacters(field, ' ');

		    vm.sortingServer.orderBy = field;
		    if (vm.sortingServer.orderDesc == '') { vm.sortingServer.orderDesc = 'desc'; }
		    else { vm.sortingServer.orderDesc = ''; }

		    return getAllDataTypesServer();
		}
	    // #endregion

		function goToAllDataType(allDataType) {
			if (allDataType && allDataType.id) {
				$location.path('/allDataType/' + allDataType.id);
			}
		}
	    // #endregion
	}
    // #endregion
})();

