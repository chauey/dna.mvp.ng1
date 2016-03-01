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
            //allDataTypeValidation.applyValidators(metadataStore);
            //validationValidation.applyValidators(metadataStore);
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
