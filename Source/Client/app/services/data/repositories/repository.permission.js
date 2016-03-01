
(function () {
    'use strict';

    var serviceId = 'repository.permission';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryPermission]);

    function RepositoryPermission(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.permission;
        var controllerName = model.controllerNames.permission;
        var service = new dataService(entityName);
        var nameForFilter = "name";

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
            this.getAllWithoutPaging = getAllWithoutPaging;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // #region Get Data        
        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            return service.getAll(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter);
        }


        function getById(id, forceRemote) {
            return service.getById(id);
        }

        function put(id, entity) {
            return service.put(id, entity);
        }

        function patch(id, entity) {
            return service.patch(id, entity);
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

        function getFilteredCount(integerFilter) {
            return service.getCount(nameForFilter, filter);
        }

        function getFilteredCountServer(filter) {
            return service.getCount(nameForFilter, filter);
        }


        function getAllWithoutPaging(orderBy) {
            return service.getAllWithoutPaging(orderBy);
        }
        // #endregion

        function _namePredicate(filterValue) {
            return Predicate
                .create('name', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return {
                //id: breeze.core.getUuid()
            };
        }
    }
})();


