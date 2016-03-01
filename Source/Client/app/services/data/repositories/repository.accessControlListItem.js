(function () {
    'use strict';

    var serviceId = 'repository.accessControlListItem';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryAccessControlListItem]);

    function RepositoryAccessControlListItem(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.accessControlListItem;
        var controllerName = model.controllerNames.accessControlListItem;
        var service = new dataService(entityName);
        var nameForFilter = "lastName";

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;

            // Exposed data access functions

            this.create = create;
            this.post = post;
            this.put = put;
            this.patch = patch;
            this.delete = deleteFunction;
            this.getById = getById;
            this.getCount = getCount;

            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;


            // get by relative ID
            this.getAllByRoleId = getAllByRoleId;
            this.getAllByDomainObjectId = getAllByDomainObjectId;
            this.getAllAccessControlListAndPermissions = getAllAccessControlListAndPermissions;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // #region Get Data        
        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter) {
            var customExpand = '&$expand=domainObject($select=name),role($select=name)'
            return service.getAllWithCustomExpand(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter, customExpand);
        }


        function getById(id, forceRemote) {
            return service.getById(id);
        }

        function put(id, entity) {
            return service.put(id, entity);
        }

        function patch(id, entity) {
            return service.patchById(id, entity);
        }

        function deleteFunction(id) {
            return service.delete(id);
        }

        function post(entity) {
            return service.post(entity);
        }

        // #endregion

        // #region Get Counts
        function getCount(forceRemote) {
            return service.getCount();
        }

        function getFilteredCount(permissionValueFilter) {
            return service.getCount(nameForFilter, filter);
        }

        function getFilteredCountServer(filter) {
            return service.getCount(nameForFilter, filter);
        }

        function getAllWithoutPaging(orderBy, expandBy) {
            return service.getAllWithoutPaging(orderBy, expandBy);            
        }

        function getAllAccessControlListAndPermissions() {
            return service.getApi('GetAllAccessControlListAndPermissions');
        }

        function _permissionValuePredicate(filterValue) {
            return Predicate
                .create('permissionValue', 'contains', filterValue);
            //.or('abbreviation', 'contains', filterValue);
        }

        // #region Get by relative ID
        function getAllByRoleId(roleId) {
            var query = "$expand=domainObject($select=name),role($select=name)&$filter=roleId eq '" + roleId + "'";
            return service.get(query);
        }

        function getAllByDomainObjectId(domainObjectId) {
            var query = '$expand=domainObject($select=name),role($select=name)&$filter=domainObjectId eq ' + domainObjectId;
            return service.get(query);
        }
        // #endregion            

        function create() {
            return {
                createdDate: new Date(),
                // TODO: Discuss about createdBy
                createdBy: "0"
            };
        }
    }
})();