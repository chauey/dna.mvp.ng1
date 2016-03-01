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

    var serviceId = 'typeOfType.validation';

    angular.module('app.services.data').factory(serviceId, ['common', typeOfTypeValidation]);

    function typeOfTypeValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator;

        // Add custom validations variables here
        var requireReferenceValidator;
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
        function applyValidators(metadataStore)
        {
            // Customs
            applyRequireReferenceValidators(metadataStore);

            //log('Validators applied.', null, serviceId);
        }

        // This function is called in model.configureMetadataStore()
        // Create & register custom validations
        function createAndRegister(eNames) {
            entityNames = eNames;

            requireReferenceValidator = createRequireReferenceValidator();
            Validator.register(requireReferenceValidator);

            //log('Validators created and registered.', null, serviceId, false);
        }
        //#endregion
        
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
            // List require fields here
            var navigations = ['name', 'abbreviation'];
            var entityType = metadataStore.getEntityType(entityNames.typeOfType);

            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }
        //#endregion
    }
})();