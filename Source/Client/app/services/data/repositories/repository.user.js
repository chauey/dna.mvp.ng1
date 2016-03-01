
(function () {
    'use strict';

    var serviceId = 'repository.user';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryUser]);

    function RepositoryUser(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.user;
        var controllerName = model.controllerNames.user;
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
            this.delete = deleteFunction;
            this.getById = getById;
            this.getCount = getCount;
            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAspNetRolesByRefUserId = getAspNetRolesByRefUserId;
            this.getUnassignedAspNetRolesByRefUserId = getUnassignedAspNetRolesByRefUserId;
            this.updatedAspNetRoles = updatedAspNetRoles;
            this.getAll = getAll;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        function updatedAspNetRoles(userId, assignedRoleList) {
            debugger;
            var assignedRoleIdList = [];
            for (var i = 0; i < assignedRoleList.length; i++) {
                assignedRoleIdList.push(assignedRoleList[i].id);
            }

            var aspNetUserRolesDto = {
                userId: userId,
                rolesIds: assignedRoleIdList
            }

            service.postApi("UpdatedAspNetRoles", aspNetUserRolesDto);
        }

        function getAspNetRolesByRefUserId(id) {
            return service.getApi("GetAspNetRolesByRefUserId/" + id);
        }

        function getUnassignedAspNetRolesByRefUserId(id) {
            return service.getApi("GetUnassignedAspNetRolesByRefUserId/" + id);
        }

        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            return service.getAll(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter);
        }

        function getById(id) {
            return service.getByIdString(id);
        }

        function deleteFunction(id) {
            return service.deleteByString(id);
        }

        function post(entity) {
            return service.post(entity);
        }

        function put(id, entity) {
            return service.putByString(id, entity);
        }

        function getCount() {
            return service.getCount();
        }

        function getAll() {
            return service.getAll();
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
            //    userID: breeze.core.getUuid(),
            //    createdDate: new Date(),
            //});
        }
    }
})();


