(function () {
    'use strict';

    var serviceId = 'repository.typeOfType';

    angular.module('app').factory(serviceId,
        ['common', 'model', 'repository.abstract', 'dataService', RepositoryTypeOfType]);

    function RepositoryTypeOfType(common, model, AbstractRepository, dataService) {
        var entityName = model.entityNames.typeOfType;
        var controllerName = model.controllerNames.typeOfType;
        var service = new dataService(entityName);
        var nameForFilter = "name";

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.controllerName = controllerName;

            // Exposed data access functions
            // Client-side
            this.create = create;
            this.save = save;
            this.remove = remove;
            //this.create_Validation = create_Validation;
            //this.getById_Validation = getById_Validation;
            //this.getById_ValidationNG = getById_ValidationNG;

            //this.getAll = getAll;
            this.getById = getById;
            this.getCount = getCount;

            // Server-side
            this.getAllServer = getAllServer;
            this.getFilteredCountServer = getFilteredCountServer;
            this.getAllWithoutPaging = getAllWithoutPaging;

            // get by relative ID
            this.getAllByParent = getAllByParent;
            this.getAllByType = getAllByType;
        }

        AbstractRepository.extend(Ctor);

        return Ctor;

        //#region Get Data
        function getAllServer(forceRemote, orderBy, orderDesc, page, size, nameFilter) {
            return service.getAll(forceRemote, orderBy, orderDesc, page, size, nameForFilter, nameFilter);
        }

        function getById(id, forceRemote) {
            return service.getById(id);
        }
        //#endregion

        //#region Get Counts
        function getCount(forceRemote) {
            return service.getCount();
        }

        function getFilteredCountServer(filter) {
            return service.getCount(nameForFilter, filter);
        }

        function getAllWithoutPaging(query) {
            return service.get(query);
        }
        //#endregion

        // #region Get by relative ID

        function getAllByParent(parentId) {
            var query = '$filter=parentID eq ' + parentId;
            return service.get(query);
        }

        function getAllByType(typeId) {
            var query = '$filter=typeID eq ' + typeId;
            return service.get(query);
        }

        // #endregion

        function create() {
            return service.createNewEntity();
        }

        function save(entity, isNew) {
            if (isNew) {
                return service.post(entity);
            }

            return service.put(entity.typeOfTypeID, entity);
        }

        function remove(id) {
            return service.deleteByGuid(id);
        }
    }
})();