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

    var serviceId = 'validation.validation';

    angular.module('app.services.data').factory(serviceId, ['common', validationValidation]);

    function validationValidation(common) {
        var entityNames;
        var log = common.logger.getLogFn(serviceId);
        var Validator = breeze.Validator;

        // Add custom validations variables here
        var dnaContainsCustomValidator,
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
        function applyValidators(metadataStore)
        {
            // Breeze built-ins
            applyIntegerValidators(metadataStore);
            applyDateValidators(metadataStore);
            applyEmailValidators(metadataStore);
            applyStringValidators(metadataStore);
            applyMaxLengthValidators(metadataStore);
            applyUrlValidators(metadataStore);

            // Customs
            applyDnaStartsWithCustomValidators(metadataStore);
            applyDnaContainsCustomValidators(metadataStore);
            applyIntegerCustomValidators(metadataStore);
            applyStringLengthCustomValidators(metadataStore);
            applyRangeCustomValidators(metadataStore);
            applySpecialCharactersCustomValidators(metadataStore);

            //log('Validators applied.', null, serviceId);
        }

        // This function is called in model.configureMetadataStore()
        // Create & register custom validations
        function createAndRegister(eNames) {
            entityNames = eNames;

            dnaStartsWithCustomValidator = createDnaStartsWithCustomValidator();
            dnaContainsCustomValidator = createDnaContainsCustomValidator();
            integerCustomValidator = createIntegerCustomValidator();

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
                .push(Validator.maxLength( {maxLength: 15}));
            entityType.getProperty('zip').validators
                .push(Validator.maxLength( {maxLength: 5}));
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
        //#region starts with 'DNA' or 'DNA' (regEx)
        function createDnaStartsWithCustomValidator() {
            var val = Validator.makeRegExpValidator(
                'startsWithDNA',
                /^(DNA|dna)/,
                "'%value%' must starts with 'DNA' or 'dna'.");
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
                /DNA|dna/,
                "'%value%' must contains 'DNA' or 'dna'.");
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

        //#region stringLength
        function maxLengthValidator(value, context) {
            if (value == null) return true; // empty string
            return (value && value.toString().length <= context.maxLength);
        }

        function createStringLengthCustomValidator(context) {
            var name = 'stringMinMaxLength'; // 'stringLength' coincides Breeze built-in validation name
            var ctx = {
                messageTemplate: '%displayName% must be equal or less than %maxLength% characters.',
                maxLength: context.maxLength
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