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

    var serviceId = 'allDataType.validation';

    angular.module('app.services.data').factory(serviceId, ['common', allDataTypeValidation]);

    function allDataTypeValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator;

        // Add custom validations variables here
        var requireReferenceValidator
                    , DecimalCustomValidator
                    , FloatCustomValidator
                    , GeographyCustomValidator
                    , MoneyCustomValidator
                    , NumericCustomValidator
                    , RealCustomValidator
                    , SmallDateTimeCustomValidator
                    , SmallMoneyCustomValidator
                    , TinyIntCustomValidator
        ;

        var service = {
            applyValidators: applyValidators,
            createAndRegister: createAndRegister
        };

        return service;


        // #region Create & apply validations       
        // #region Required
        function applyRequireReferenceValidators(metadataStore) {
            var entityType;
            var navigations;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Get all required columns
            navigations = [
                                'timeStamp',
            ];

            // Push validation
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(requireReferenceValidator);
            });
        }

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
        // #endregion


        // #region Number
        function applyIntValidators(metadataStore) {
            var entityType;
            var navigations;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Get Number columns
            navigations = [
                                'int',
            ];

            // Push validation
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(Validator.int32());
            });
        }

        function applyBigIntValidators(metadataStore) {
            var entityType;
            var navigations;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Get Number columns
            navigations = [
                                'bigInt',
            ];

            // Push validation
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(Validator.int64());
            });
        }

        function applySmallIntValidators(metadataStore) {
            var entityType;
            var navigations;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Get Number columns
            navigations = [
                                'smallInt',
            ];

            // Push validation
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(Validator.int16());
            });
        }
        // #endregion


        // #region Date
        function applyDateValidators(metadataStore) {
            var entityType;
            var navigations;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Get date columns
            navigations = [
                                'dateTime',
            ];

            // Push validation
            navigations.forEach(function (propertyName) {
                entityType.getProperty(propertyName).validators
                    .push(Validator.date());
            });
        }
        // #endregion


        // #region Max length
        function applyMaxLengthValidators(metadataStore) {
            var entityType;

            // Get entity type of the table
            entityType = metadataStore.getEntityType('AllDataType');

            // Push validation
            entityType.getProperty('binary').validators
.push(Validator.maxLength({ maxLength: 50 }));
            entityType.getProperty('char').validators
.push(Validator.maxLength({ maxLength: 10 }));
            entityType.getProperty('image').validators
.push(Validator.maxLength({ maxLength: 2147483647 }));
            entityType.getProperty('nChar').validators
.push(Validator.maxLength({ maxLength: 10 }));
            entityType.getProperty('nText').validators
.push(Validator.maxLength({ maxLength: 1073741823 }));
            entityType.getProperty('nVarChar').validators
.push(Validator.maxLength({ maxLength: 50 }));
            entityType.getProperty('text').validators
.push(Validator.maxLength({ maxLength: 2147483647 }));
            entityType.getProperty('varBinary').validators
.push(Validator.maxLength({ maxLength: 50 }));
            entityType.getProperty('varChar').validators
.push(Validator.maxLength({ maxLength: 50 }));
            entityType.getProperty('zSql_Variant').validators
.push(Validator.maxLength({ maxLength: 50 }));
        }
        // #endregion


        // #region Extended Properties
        function createDecimalCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'decimal',
                /^[0-9]{1,18}?$/,
                "The %displayName% is not a valid");
            return val;
        }

        function applyDecimalCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('decimal').validators
                .push(DecimalCustomValidator);
        }
        function createFloatCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'float',
                /^[-+]?[0-9]+([.][0-9]+)?$/,
                "The %displayName% is not a valid.");
            return val;
        }

        function applyFloatCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('float').validators
                .push(FloatCustomValidator);
        }
        function createGeographyCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'geography',
                /^[-+]?[0-9]+([.][0-9]+),[ ]?[-+]?[0-9]+([.][0-9]+)?$/,
                "The %displayName% is not a valid.");
            return val;
        }

        function applyGeographyCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('geography').validators
                .push(GeographyCustomValidator);
        }
        function createMoneyCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'money',
                /^[-+]?[0-9]+([.][0-9]+)?$/,
                "The %displayName% is not a valid");
            return val;
        }

        function applyMoneyCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('money').validators
                .push(MoneyCustomValidator);
        }
        function createNumericCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'numeric',
                /^[-+]?[0-9]+([.][0-9]+)?$/,
                "The %displayName% is not a valid");
            return val;
        }

        function applyNumericCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('numeric').validators
                .push(NumericCustomValidator);
        }
        function createRealCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'realCustom',
                /^[-+]?[0-9]+([.][0-9]+)$/,
                "The %displayName% is not a match the Regex");
            return val;
        }

        function applyRealCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            var custValidators = entityType.getProperty('real').validators;
            custValidators.splice(0, custValidators.length);
            
            entityType.getProperty('real').validators
                .push(RealCustomValidator);
        }

        function createVarCharCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'varCharCustom',
                /^[-+]?[0-9]+([.][0-9]+)$/,
                "The %displayName% is not a match the Regex");
            return val;
        }

        function applyVarCharCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            var custValidators = entityType.getProperty('varChar').validators;
            custValidators.splice(0, custValidators.length);

            entityType.getProperty('varChar').validators
                .push(RealCustomValidator);
        }
        function createSmallDateTimeCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'smalldatetime',
                /^(0[1-9]|[12][0-9]|3[01])(-)(0[1-9]|1[012])(-)(19|20[0-7][0-9])(\s[\d]{1,2}:[\d]{1,2}(\s)(am|AM|pm|PM)?)?$/,
                "The %displayName% is not a valid");
            return val;
        }

        function applySmallDateTimeCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('smallDateTime').validators
                .push(SmallDateTimeCustomValidator);
        }
        function createSmallMoneyCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'smallmoney',
                /^[-+]?[0-9]+([.][0-9]+)?$/gm,
                "The %displayName% is not a valid as Regex");
            return val;
        }

        function applySmallMoneyCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('smallMoney').validators
                .push(SmallMoneyCustomValidator);
        }
        function createTinyIntCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'tinyint',
                /(^[0-9]$)|(^[1-9][0-9]$)|(^[0-2][0-5][0-5]$)/,
                "The %displayName% is not a valid");
            return val;
        }

        function applyTinyIntCustomValidators(metadataStore) {
            var entityType = metadataStore.getEntityType('AllDataType');
            entityType.getProperty('tinyInt').validators
                .push(TinyIntCustomValidator);
        }
        // #endregion
        // #endregion


        // #region Validation configurations
        // This function is called in model.extendMetadata()
        // Apply Breeze & custom validations
        function applyValidators(metadataStore) {
            // Required
            applyRequireReferenceValidators(metadataStore);

            // Data types
            applyDateValidators(metadataStore);
            applyIntValidators(metadataStore);
            applyBigIntValidators(metadataStore);
            applySmallIntValidators(metadataStore);

            // Max length
            applyMaxLengthValidators(metadataStore);

            // Extended properties
            applyDecimalCustomValidators(metadataStore);
            applyFloatCustomValidators(metadataStore);
            applyGeographyCustomValidators(metadataStore);
            applyMoneyCustomValidators(metadataStore);
            applyNumericCustomValidators(metadataStore);
            applyRealCustomValidators(metadataStore);
            applySmallDateTimeCustomValidators(metadataStore);
            applySmallMoneyCustomValidators(metadataStore);
            applyTinyIntCustomValidators(metadataStore);
            applyVarCharCustomValidators(metadataStore);

            // data constraints
        }

        // This function is called in model.configureMetadataStore()
        // Create & register custom validations
        function createAndRegister(eNames) {
            entityNames = eNames;

            // Required
            requireReferenceValidator = createRequireReferenceValidator();
            Validator.register(requireReferenceValidator);

            // Extended properties
            DecimalCustomValidator = createDecimalCustomValidator();
            Validator.register(DecimalCustomValidator);
            FloatCustomValidator = createFloatCustomValidator();
            Validator.register(FloatCustomValidator);
            GeographyCustomValidator = createGeographyCustomValidator();
            Validator.register(GeographyCustomValidator);
            MoneyCustomValidator = createMoneyCustomValidator();
            Validator.register(MoneyCustomValidator);
            NumericCustomValidator = createNumericCustomValidator();
            Validator.register(NumericCustomValidator);
            RealCustomValidator = createRealCustomValidator();
            Validator.register(RealCustomValidator);
            SmallDateTimeCustomValidator = createSmallDateTimeCustomValidator();
            Validator.register(SmallDateTimeCustomValidator);
            SmallMoneyCustomValidator = createSmallMoneyCustomValidator();
            Validator.register(SmallMoneyCustomValidator);
            TinyIntCustomValidator = createTinyIntCustomValidator();
            Validator.register(TinyIntCustomValidator);

            //FOR TESTING
            Validator.register(createVarCharCustomValidator());

            ////log('Validators created and registered.', null, serviceId, false);
        }
        // #endregion        
    }
})();
