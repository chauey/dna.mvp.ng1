
(function () {
    'use strict';

    var serviceId = 'repository.allDataType';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryAllDataType]);

    function RepositoryAllDataType(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.allDataType;
        var controllerName = model.controllerNames.allDataType;
        var service = new dataService(entityName);
        var nameForFilter = "lastName";
        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;
            this.manager = mgr;

            // Exposed data access functions
            // Client-side
            this.create = create;
            this.post = post;
            this.put = put;
            this.patch = patch;
            this.delete = deleteFunction;
            this.getById = getById;
            this.getCount = getCount;
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            return service.getAll(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter);
        }

        function getById(id) {
            return service.getByIdGuid(id);
        }

        function deleteFunction(id) {
            return service.deleteByString(id);
        }

        function post(entity) {
            return service.post(entity);
        }

        function put(id, entity) {
            return service.putByGuid(id, entity);
        }

        function patch(id, entity) {
            return service.patchByGuid(id, entity);
        }

        function getCount() {
            return service.getCount();
        }

        function getFilteredCountServer(filter) {
            return service.getCount(nameForFilter, filter);
        }

        function create() {
            return {
                id: "'" + breeze.core.getUuid() + "'",
                createdDate: new Date(),
            };
            //return this.manager.createEntity(entityName, {
            //    id: breeze.core.getUuid(),
            //    createdDate: new Date(),
            //});
        }
    }
})();


