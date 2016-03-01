(function () {
    /**
     * @description
     * 
     * An overall app service:
     * - Initialize repository pattern, local storage and work in progress (WIP).
     * - Initialize Breeze setup for entities change and changes changed (for WIP).
     * - Initialize data when app or a route loads.
     * - Implement Breeze save, cancel, delete entity.
     */

    'use strict';

    var serviceId = 'datacontext';
    angular.module('app.services.data').factory(serviceId,
        ['$rootScope', 'common', 'config', 'entityManagerFactory', 'model',
            'repositories', 'zStorage', 'zStorageWip', datacontext]);

    function datacontext($rootScope, common, config, emFactory, model,
        repositories, zStorage, zStorageWip) {
        var entityNames = model.entityNames;
        var events = config.events;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var manager = emFactory.newManager();
        var primePromise;
        var repoNames = [
            'typeOfType',
            'lookup',
            'validation',
            'admin',
            'attachment',
            'allDataType',
            'user',
            'accessControlListItem',
            'aspNetRole',
            'aspNetUser',
            'aspNetUserRole',
            'auditLog',
            'domainObject',
            'eLMAH_Error',
            'permission',
            'customer'
        ]; // Add more repo names here
        var $q = common.$q;

        var service = {
            prime: prime,
            cancel: cancel,
            save: save,
            markDeleted: markDeleted,
            zStorage: zStorage,
            zStorageWip: zStorageWip
        };

        init();

        return service;

        function init() {
            zStorage.init(manager);
            zStorageWip.init(manager);
            repositories.init(manager);
            defineLazyLoadedRepos();
            setupEventForHasChangesChanged();
            setupEventForEntitiesChanged();
            listenForStorageEvents();
        }

        //#region Repository Pattern

        // Add ES5 property to datacontext for each named repo
        function defineLazyLoadedRepos() {
            repoNames.forEach(function (name) {
                Object.defineProperty(service, name, {
                    configurable: true, // will redefine this property once
                    get: function () {

                        // The 1st time the repo is request via this property, 
                        // we ask the repositories for it (which will inject it).
                        var repo = repositories.getRepo(name);

                        // Rewrite this property to always return this repo;
                        // no longer redefinable
                        Object.defineProperty(service, name, {
                            value: repo,
                            configurable: false,
                            enumerable: true
                        });
                        return repo;
                    }
                });
            });
        }
        //#endregion

        //#region Prime Data
        // This function is called in config.route setRoute
        function prime() {
            if (primePromise) {
                return primePromise;
            }

            // Look in local storage and if data is there, grab it;
            // otherwise get from 'resources'
            var storageEnabledAndHasData = zStorage.load(manager);

            primePromise = storageEnabledAndHasData ?
                $q.when(log('Loading entities and metadata from Local Storage.')) :
                $q.all([service.lookup.getAll()])
                .then(extendMetadata);

            return primePromise.then(success);

            function success() {
                service.lookup.setLookups();
                zStorage.save();
                log('Primed the data.');
            }

            function extendMetadata() {
                var metadataStore = manager.metadataStore;

                model.extendMetadata(metadataStore);
            }
        }
        //#endregion

        //#region Save - Cancel - Delete
        function cancel() {
            if (manager.hasChanges()) {
                manager.rejectChanges();
                logSuccess('Canceled changes.', null, true);
            }
        }

        function save(resourceName) {
            
            if (resourceName != '') {
                // http://stackoverflow.com/questions/20180078/how-to-handle-authorization-with-breeze-js
                var saveOptions = new breeze.SaveOptions({ resourceName: resourceName });
                // null = 'all-pending-changes'; saveOptions is the 2nd parameter
                return manager.saveChanges(null, saveOptions)
                .then(saveSucceeded).catch(saveFailed);
            }
            else {
                return manager.saveChanges()
                    .then(saveSucceeded).catch(saveFailed);
            }

            function saveSucceeded(result) {
                zStorage.save();
                logSuccess('Saved data.', null, true);
            }

            function saveFailed(error) {
                
                if (error.status != 401) {
                    var msg = config.appErrorPrefix + 'Save failed: ' +
                                    breeze.saveErrorMessageService.getErrorMessage(error) + '<br/>';
                    error.message = msg;
                    logError(msg, error);
                    throw error;
                }
            }
        }

        function markDeleted(entity) {
            return entity.entityAspect.setDeleted();
        }
        //#endregion

        //#region Detect Changes
        function setupEventForHasChangesChanged() {
            manager.hasChangesChanged.subscribe(function (eventArgs) {
                var data = { hasChanges: eventArgs.hasChanges };

                // Send the message (the Controller receives it)
                // $boradcast sends an event (message) to all child scopes
                common.$broadcast(events.hasChangesChanged, data);
            });
        }

        function setupEventForEntitiesChanged() {

            // We use this for detecting changes of any kind so we can save them to local storage
            manager.entityChanged.subscribe(function (changeArgs) {
                if (changeArgs.entityAction === breeze.EntityAction.PropertyChange) {
                    common.$broadcast(events.entitiesChanged, changeArgs);
                }
            });
        }
        //#endregion

        //#region Local Storage
        function listenForStorageEvents() {
            $rootScope.$on(config.events.storage.storeChanged, function (event, data) {
                log('Updated local storage.', data, true);
            });
            $rootScope.$on(config.events.storage.wipChanged, function (event, data) {
                log('Updated WIP.', data, true);
            });
            $rootScope.$on(config.events.storage.error, function (event, data) {
                logError('Error with local storage. ' + data.activity, data, true);
            });
        }
        //#endregion
    }
})();