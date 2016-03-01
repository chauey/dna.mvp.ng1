(function () {
    /**
     * @description
     * 
     * Access Control List service, responsive for:
     * - Store Access Control List and Permission List
     */

    'use strict';

    var serviceId = 'aclService';

    angular.module('app.services.data').factory(serviceId,
        ['$http', '$q', 'localStorageService', 'datacontext', aclService]);

    function aclService($http, $q, localStorageService, datacontext) {

        var accessControlList = [];
        var permissions = [];

        var service = {
            getAllAccessControlListAndPermissions: getAllAccessControlListAndPermissions,
            accessControlList: accessControlList,
            permissions: permissions,

            getAccessControlList: getAccessControlList,
            getPermissions: getPermissions,
            clearAccessControlList: clearAccessControlList,
            clearPermissions: clearPermissions,
        };

        return service;

        function getAllAccessControlListAndPermissions(orderBy, orderDesc) {

            var deferred = $q.defer();
            var domainObjectOrderBy = orderBy;
            if (orderDesc) { domainObjectOrderBy = orderBy + ' ' + orderDesc; }

            accessControlList = localStorageService.get('accessControlList');
            permissions = localStorageService.get('permissions');

            if (accessControlList != null && accessControlList != undefined &&
                permissions != null && permissions != undefined &&
                (accessControlList.length > 0 || permissions.length > 0)) {

                deferred.resolve({
                    accessControlList: accessControlList,
                    permissions: permissions
                });

            }
            else {
                
                datacontext.accessControlListItem.getAllAccessControlListAndPermissions()
                    .then(function (result) {
                        accessControlList = result.data.accessControlList;
                        permissions = result.data.permissions;

                        localStorageService.set('accessControlList', accessControlList);
                        localStorageService.set('permissions', permissions);
                        deferred.resolve(result.data);
                    })
                    //.error(function (err, status) {
                    //    deferred.reject(err);
                    //})
                ;

            }

            return deferred.promise;
        }

        function getAccessControlList() {

            accessControlList = localStorageService.get('accessControlList');
            if (!accessControlList) {
                getAllAccessControlListAndPermissions('name', '', true);
            }

            return accessControlList;
        }

        function getPermissions() {

            permissions = localStorageService.get('permissions');
            if (!permissions) {
                getAllAccessControlListAndPermissions('name', '', true);
            }

            return permissions;
        }

        function clearAccessControlList() {

            localStorageService.remove('accessControlList');
        }

        function clearPermissions() {

            localStorageService.remove('permissions');
        }
    }
})();