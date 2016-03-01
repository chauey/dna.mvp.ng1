
(function () {
    'use strict';

    var serviceId = 'repository.validation';

    angular.module('app').factory(serviceId,
        ['model', 'repository.abstract', 'zStorage', 'zStorageWip', 'dataService', RepositoryValidation]);

    function RepositoryValidation(model, AbstractRepository, zStorage, zStorageWip, dataService) {
        var entityName = model.entityNames.validation;
        var controllerName = model.controllerNames.validation;       
        var service = new dataService(entityName);
        var nameForFilter = "string";

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
            return service.getByIdGuid(id);
        }

        function put(id, entity) {
            return service.putByGuid(id, entity);
        }

        function patch(id, entity) {
            return service.patchByGuid(id, entity);
        }

        function deleteFunction(id) {
            return service.deleteByGuid(id);
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
            var self = this;
            orderBy = orderBy || 'name';


            return EntityQuery.from(controllerName)
              .orderBy(orderBy)
              .using(self.manager).execute()
              .then(querySucceeded).catch(self._queryFailed);

            function querySucceeded(data) {
               self.log('Retrieved [Validations] from remote data source.', data.results.length, true);
                return data.results;
            }
        }
        // #endregion

        function _integerPredicate(filterValue) {
            return Predicate
                .create('integer', 'contains', filterValue);
                //.or('abbreviation', 'contains', filterValue);
        }
	        // #endregion


        function create() {
            return {
                validationID: breeze.core.getUuid()
            };
        }
    }
})();


