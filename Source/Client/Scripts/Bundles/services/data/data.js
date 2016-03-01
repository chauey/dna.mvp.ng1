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
                $q.all([service.lookup.getAll(), service.typeOfType.getAll()])
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
(function () {
/**
 * @description
 * 
 * App service helps to:
 * - Talk with angular to datacontext to Breeze to get to the back-end
 * - Configure Breeze validation options.
 */

    'use strict';
    
    var serviceId = 'entityManagerFactory';
    angular.module('app.services.data').factory(serviceId, ['breeze', 'config', 'model', emFactory]);

    function emFactory(breeze, config, model) {
        // Validate when click save
        // (do not validate when we attach a newly created entity to an EntityManager and when property change.)
        // We could also set this per entityManager
        new breeze.ValidationOptions({ validateOnAttach: false, validateOnPropertyChange: false }).setAsDefault();

        configureBreeze();
        // Config serviceName
        var serviceRoot = window.location.protocol + '//' + window.location.host + '/'; //"http://localhost:12483/"
        var serviceName = config.remoteServiceName; // "breeze/Breeze"

        var metadataStore = createMetadataStore();

        var provider = {
            metadataStore: metadataStore,
            newManager: newManager,
            serviceRoot: serviceRoot,
            serviceName: serviceName
        };
        
        return provider;

        function configureBreeze() {
            // use Web API OData to query and save
            //breeze.config.initializeAdapterInstance('dataService', 'webApiOData', true);

            // convert between server-side PacalCase and client-side camelCase
            breeze.NamingConvention.camelCase.setAsDefault();
        }

        function createMetadataStore() {
            var store = new breeze.MetadataStore();
            model.configureMetadataStore(store);
            return store;
        }

        function newManager() {
            var mgr = new breeze.EntityManager(
                {
                    serviceName: serviceName,
                    metadataStore: metadataStore
                });
            return mgr;
        }
    }
})();
(function () {
/**
 * @description
 * 
 * App service to config Breeze metdata store:
 * - Entity & controller names.
 * - Configure and extend metadataStore.
 */

    'use strict';

    var serviceId = 'model';

    angular.module('app.services.data').factory(serviceId, ['allDataType.validation', 'validation.validation', model]);

    function model(allDataTypeValidation, validationValidation) {
        var entityNames = {
            typeOfType: 'TypeOfType',
            validation: 'Validation',
            account: 'AspNetUser',
            audit: 'AuditLog',
            error: 'ELMAH_Error',
            attachment: 'Attachment',
            allDataType: 'AllDataType',
            user: 'User',
            accessControlListItem: 'AccessControlListItem', 
            aspNetRole: 'AspNetRole', 
            aspNetUserRole: 'AspNetUserRole', 
            aspNetUser: 'AspNetUser', 
            domainObject: 'DomainObject', 
            permission: 'Permission', 
            customer: 'Customer', 
            // Add more entity names here
            customer: 'Customer'
        };

        var controllerNames = {
            typeOfType: 'TypeOfTypes',
            validation: 'Validations',
            account: 'AspNetUsers',
            audit: 'AuditLogs',
            error: 'ELMAH_Errors',
            attachment: 'Attachments',
            allDataType: 'AllDataTypes',
            user: 'Users',
            accessControlListItem: 'AccessControlListItems', 
            aspNetRole: 'AspNetRoles', 
            aspNetUserRole: 'AspNetUserRoles', 
            aspNetUser: 'AspNetUsers', 
            domainObject: 'DomainObjects', 
            permission: 'Permissions', 
            customer: 'Customers',
            // Add more controller names here
            customer: 'Customers'
        };

        var service = {
            configureMetadataStore: configureMetadataStore,
            entityNames: entityNames,
            controllerNames: controllerNames,
            createNullos: createNullos,
            extendMetadata: extendMetadata
        };

        return service;

        function configureMetadataStore() {
            // Create and register validations
            allDataTypeValidation.createAndRegister(entityNames);
            validationValidation.createAndRegister(entityNames);
        }

        // This function is called in model.prime.extendMetadata
        function extendMetadata(metadataStore) {
            // Apply validations
            allDataTypeValidation.applyValidators(metadataStore);
            validationValidation.applyValidators(metadataStore);
        }

        // Not currently used this method, from BreezeController instead
        function createNullos(manager) {
            var unchanged = breeze.EntityState.Unchanged;

            //createNullo(entityNames.typeOfType);
            // Just need to create nullo for the entity type that is not included in lookup lists
            // Add more Nullos here

            function createNullo(entityName, values) {
                var initialValues = values || { name: ' [Select a ' + entityName + ']' };
                return manager.createEntity(entityName, initialValues, unchanged);
            }
        }
    }
})();

(function () {
    /**
     * @description
     * 
     * App service to handle Breeze built-in and custom validations:
     * - Create.
     * - Register.
     * - Apply.
     */

    'use strict';

    var serviceId = 'model.validation';

    angular.module('app.services.data').factory(serviceId, ['common', modelValidation]);

    function modelValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator;

        // Add custom validations variables here
        var requireReferenceValidator,
            dnaContainsCustomValidator,
            dnaStartsWithCustomValidator,
            integerCustomValidator;
        // these custom validatons are created and registered when created
        // stringLength, valueRange, specialChars

        var service = {
            applyValidators: applyValidators,
            createAndRegister: createAndRegister
        };

        return service;

        //#region Validation configurations
        // This function is called in model.extendMetadata()
        // Apply Breeze & custom validations
        function applyValidators(metadataStore) {
            // Breeze built-ins
            applyIntegerValidators(metadataStore);
            applyDateValidators(metadataStore);
            applyEmailValidators(metadataStore);
            applyStringValidators(metadataStore);
            applyMinLengthValidators(metadataStore);
            applyMaxLengthValidators(metadataStore);
            applyUrlValidators(metadataStore);

            // Customs
            applyRequireReferenceValidators(metadataStore);
            applyDnaStartsWithCustomValidators(metadataStore);
            applyDnaContainsCustomValidators(metadataStore);
            applyIntegerCustomValidators(metadataStore);
            applyPhoneValidators(metadataStore);
            applyZipValidators(metadataStore);
            applyCreditCardValidators(metadataStore);
            applyStringLengthCustomValidators(metadataStore);
            applyRangeCustomValidators(metadataStore);
            applySpecialCharactersCustomValidators(metadataStore);

            //log('Validators applied.', null, serviceId);
        }

        // This function is called in model.configureMetadataStore()
        // Create & register custom validations
        function createAndRegister(eNames) {
            entityNames = eNames;

            requireReferenceValidator = createRequireReferenceValidator();
            dnaStartsWithCustomValidator = createDnaContainsCustomValidator();
            dnaContainsCustomValidator = createDnaStartsWithCustomValidator();
            integerCustomValidator = createIntegerCustomValidator();

            Validator.register(requireReferenceValidator);
            Validator.register(dnaStartsWithCustomValidator);
            Validator.register(dnaContainsCustomValidator);
            Validator.register(integerCustomValidator);

            //log('Validators created and registered.', null, serviceId, false);
        }
        //#endregion

        //#region Create & apply validations
        //#region Breeze built-ins

        //The Breeze Validator class offers some stock property validators, all available as static methods.
        //http://www.breezejs.com/sites/all/apidocs/classes/Validator.html
        //integer           //APPLY FOR NUMERIC SERVER DATA TYPE ONLY!
        //date, string and many more "dataType" validators that ensure new values conform to the target data type
        //creditCard
        //emailAddress
        //maxLength         //APPLY FOR STRING SERVER DATA TYPE ONLY!
        //phone (BETA)
        //regularExpression
        //required
        //url

        //#region integer (apply for numeric datatype, for string see customs)
        function applyIntegerValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);
            var navigations = ['integer', 'age', 'creditCard'];

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(Validator.integer());
            });
        }
        //#endregion

        //#region date
        function applyDateValidators(metadataStore) {
            var navigations = ['date', 'beforeDate', 'afterDate'];
            var entityType = metadataStore.getEntityType(entityNames.validation);

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                .push(Validator.date());
            });
        }
        //#endregion

        //#region string
        function applyStringValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);

            entityType.getProperty('string').validators
                .push(Validator.string());
        }
        //#endregion

        //#region maxLength (apply for String datatype, for numeric see customs)
        function applyMaxLengthValidators(metadataStore, length) {
            var entityType = metadataStore.getEntityType(entityNames.validation);

            entityType.getProperty('phone').validators
                .push(Validator.maxLength({ maxLength: 15 }));
            entityType.getProperty('zip').validators
                .push(Validator.maxLength({ maxLength: 5 }));
        }

        function applyMinLengthValidators(metadataStore, length) {
            var entityType = metadataStore.getEntityType(entityNames.validation);

            //entityType.getProperty('creditCard').validators
            //    .push(Validator.stringLength({ minLength: 15, maxLength: 16 }));
            //entityType.getProperty('phone').validators
            //    .push(Validator.stringLength({ minLength: 10, maxLength: 15 }));
            entityType.getProperty('zip').validators
                .push(Validator.stringLength({ minLength: 5, maxLength: 10 }));
        }
        //#endregion

        //#region email
        function applyEmailValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);

            entityType.getProperty('email').validators
                .push(Validator.emailAddress());
        }
        //#endregion

        //#region url
        function applyUrlValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);

            entityType.getProperty('uRL').validators
                .push(Validator.url());
        }
        //#endregion
        //#endregion

        //#region Customs
        //#region required
        function createRequireReferenceValidator() {
            var name = 'requireReferenceEntity';

            // isRequired = true so zValidate directive displays required indicator
            var ctx = {
                messageTemplate: 'Missing %displayName%',
                isRequired: true
            };
            var val = new Validator(name, valFunction, ctx);
            return val;

            // passes if reference has a value and is not the nullo (whose id === 0)
            function valFunction(value) {
                return value ? value.id !== 0 : false;
            }
        }

        function applyRequireReferenceValidators(metadataStore) {
            var entityType;
            var navigations;

            // List require fields here
            navigations = ['name', 'abbreviation'];
            entityType = metadataStore.getEntityType(entityNames.typeOfType);

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }
        //#endregion

        //#region starts with 'DNA' or 'DNA' (regEx)
        function createDnaStartsWithCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'startsWithDNA',
                /DNA|dna/,
                "'%value%' must contains 'DNA' or 'dna'.");
            return val;
        }

        function applyDnaStartsWithCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('startsWithDPT').validators
                .push(dnaStartsWithCustomValidator);
        }
        //#endregion

        //#region contains 'DNA' or 'DNA' (regEx)
        function createDnaContainsCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'containsDNA',
                /^(DNA|dna)/,
                "'%value%' must starts with 'DNA' or 'dna'.");
            return val;
        }

        function applyDnaContainsCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('containsDPT').validators
                .push(dnaContainsCustomValidator);
        }
        //#endregion

        //#region integer (regEx)
        function createIntegerCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'integerCustom', //'integer' coincides Breeze built-in validation name
                /^[1-9]\d*$/, //starts with 0-9 and digit only
                "'%value%' is not a positive integer.");
            return val;
        }

        function applyIntegerCustomValidators(metadataStore) {
            var navigations = ['phone', 'zip'];
            var entityType = metadataStore.getEntityType(entityNames.validation);
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                .push(integerCustomValidator);
            });
        }
        //#endregion

        // #region Credit Card, Phone, Zip
        function applyCreditCardValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('creditCard').validators.push(Validator.creditCard());
        }

        function applyPhoneValidators(metadataStore) {
            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('phone').validators.push(Validator.phone());
        }

        function applyZipValidators(metadataStore) {
            function isValidZipCode(value) {
                var re = /^\d{5}([\-]\d{4})?$/;
                return (re.test(value));
            }

            // v in this case will be a Customer entity
            var valFn = function (v) {
                // This validator only validates US Zip Codes.
                //if (v.getProperty("Country") === "USA") {
                    var zipCode = v.getProperty("zip");
                    return isValidZipCode(zipCode);
                //}
                return true;
            };
            var zipCodeValidator = new Validator("zipCodeValidator", valFn,
                { messageTemplate: "For the US, this is not a valid PostalCode" }); 


            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('zip').validators.push(zipCodeValidator);
        }
        // #endregion

        //#region stringLength
        function maxLengthValidator(value, context) {
            if (value == null) return true; // empty string
            return (value && value.toString().length <= context.maxLength);
        }

        function createStringLengthCustomValidator(context) {
            var name = 'stringMinMaxLength'; // 'stringLength' coincides Breeze built-in validation name
            var ctx = {
                messageTemplate: '%displayName% must be equal or less than %maxLength% characters.',
                maxLength: context.maxLength,
            };
            var val = new Validator(name, maxLengthValidator, ctx);
            return val;
        }

        function applyStringLengthCustomValidators(metadataStore) {
            var creditCardMaxLength = createStringLengthCustomValidator({ maxLength: 16 });

            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('creditCard').validators.push(creditCardMaxLength);
        }
        //#endregion

        //#region valueRange
        function rangeCustomValidator(value, context) {
            if (value == null) return true; // empty string
            return (value && value >= context.minValue && value <= context.maxValue);
        }

        function createRangeCustomValidator(context) {
            var name = 'intRange';
            var ctx = {
                messageTemplate: '%displayName% must be between %minValue% and %maxValue%.',
                minValue: context.minValue,
                maxValue: context.maxValue
            };
            var val = new Validator(name, rangeCustomValidator, ctx);
            return val;
        }

        function applyRangeCustomValidators(metadataStore) {
            var ageRange = createRangeCustomValidator({ minValue: 1, maxValue: 150 });

            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('age').validators.push(ageRange);
        }
        //#endregion

        //#region checkSpecialCharacters
        function specialCharactersCustomValidator(value, context) {
            //var strValidChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
            var invalidChars = context.invalidChars;
            var currentChar;

            if (value == null) return true; // empty string

            //  test strString consists of valid characters listed above
            for (var i = 0; i < value.toString().length; i++) {
                currentChar = value.toString().charAt(i);
                if (invalidChars.indexOf(currentChar) != -1) {
                    return false;
                }
            }
            return true;
        }

        function createSpecialCharactersCustomValidators(context) {
            var name = 'specialCharacters';
            var ctx = {
                messageTemplate: '%displayName% cannot contains \'%invalidChars%\'',
                invalidChars: context.invalidChars
            }
            var val = new Validator(name, specialCharactersCustomValidator, ctx);
            return val;
        }

        function applySpecialCharactersCustomValidators(metadataStore) {
            var creditCardPositiveInt = createSpecialCharactersCustomValidators({ invalidChars: '-' });

            var entityType = metadataStore.getEntityType(entityNames.validation);
            entityType.getProperty('creditCard').validators.push(creditCardPositiveInt);
        }
        //#endregion
        //#endregion
        //#endregion
    }
})();
