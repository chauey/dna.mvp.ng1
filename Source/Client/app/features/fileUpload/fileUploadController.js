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