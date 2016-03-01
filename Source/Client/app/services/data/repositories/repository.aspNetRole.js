
(function () {
    'use strict';

    var serviceId = 'repository.aspNetRole';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryAspNetRole]);

    function RepositoryAspNetRole(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.aspNetRole;
        var controllerName = model.controllerNames.aspNetRole;
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
            this.getAllWithoutPaging = getAllWithoutPaging;



        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        // #region Get Data        
        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter) {
            return service.getAll(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter);
        }


        function getById(id, forceRemote) {
            return service.getByIdString(id);
        }

        function put(id, entity) {
            return service.putByString(id, entity);
        }

        function patch(id, entity) {
            return service.patchByString(id, entity);
        }

        function deleteFunction(id) {
            return service.deleteByString(id);
        }

        function post(entity) {
            return service.post(entity);
        }

        // #endregion

        // #region Get Counts
        function getCount(forceRemote) {
            return service.getCount();
        }

        function getFilteredCount(nameFilter) {
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
                id: breeze.core.getUuid()
            };
        }
    }
})();


