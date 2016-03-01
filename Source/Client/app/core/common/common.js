(function () {
/**
 * @description
 * 
 * An app module contains services:
 * - common: commonly used funtions and angular services.
 * - logger: toastr notifications (info, success, warning, error).
 * - spinner: loading icon/image with spin animation on view navigations.
 * - DNA custom variables and functions.
 */

    'use strict';
    var commonModule = angular.module('common', []);

    // Must configure the common service and set its 
    // events via the commonConfigProvider
    commonModule.provider('commonConfig', function () {
        this.config = {
            // These are the properties we need to set
            //controllerActivateSuccessEvent: '',
            //spinnerToggleEvent: ''
        };

        this.$get = function () {
            return {
                config: this.config
            };
        };
    });

    commonModule.factory('common',
        ['$q', '$rootScope', '$timeout', 'commonConfig', 'logger', common]);

    function common($q, $rootScope, $timeout, commonConfig, logger) {
        var throttles = {};

        var service = {

            // common angular dependencies
            $broadcast: $broadcast,
            $q: $q,
            $timeout: $timeout,

            // generic
            activateController: activateController,
            createSearchThrottle: createSearchThrottle,
            debouncedThrottle: debouncedThrottle,
            isNumber: isNumber,
            guid: guid,
            logger: logger, // for accessibility
            textContains: textContains,

            // DNA custom functions
            emptyGuid: '00000000-0000-0000-0000-000000000000',
            formatDate: formatjsDate,
            replaceSpecialCharacters: replaceSpecialCharacters,
            lowerCaseFirstLetter: lowerCaseFirstLetter,
            strongPasswordChecker: strongPasswordChecker
        };

        return service;

        function activateController(promises, controllerId) {
            return $q.all(promises).then(function (eventArgs) {
                var data = { controllerId: controllerId };
                $broadcast(commonConfig.config.controllerActivateSuccessEvent, data);
            });
        }

        function $broadcast() {
            return $rootScope.$broadcast.apply($rootScope, arguments);
        }

        function createSearchThrottle(viewmodel, list, filteredList, filter, delay) {
            // After a delay, search a viewmodel's list using 
            // a filter function, and return a filteredList.

            // custom delay or use default
            delay = +delay || 300;
            // if only vm and list parameters were passed, set others by naming convention 
            if (!filteredList) {
                // assuming list is named sessions, filteredList is filteredSessions
                filteredList = 'filtered' + list[0].toUpperCase() + list.substr(1).toLowerCase(); // string

                // Testing Skip the word after "filtered" as the same as it is.
                //filteredList = 'filtered' + list[0]; //.toUpperCase() + list.substr(1).toLowerCase(); // string

                // filter function is named sessionFilter
                filter = list + 'Filter'; // function in string form
            }

            // create the filtering function we will call from here
            var filterFn = function () {
                // translates to ...
                // vm.filteredSessions 
                //      = vm.sessions.filter(function(item( { returns vm.sessionFilter (item) } );
                viewmodel[filteredList] = viewmodel[list].filter(function(item) {
                    return viewmodel[filter](item);
                });
            };

            return (function () {
                // Wrapped in outer IFFE so we can use closure 
                // over filterInputTimeout which references the timeout
                var filterInputTimeout;

                // return what becomes the 'applyFilter' function in the controller
                return function(searchNow) {
                    if (filterInputTimeout) {
                        $timeout.cancel(filterInputTimeout);
                        filterInputTimeout = null;
                    }
                    if (searchNow || !delay) {
                        filterFn();
                    } else {
                        filterInputTimeout = $timeout(filterFn, delay);
                    }
                };
            })();
        }

        function debouncedThrottle(key, callback, delay, immediate) {
            // Perform some action (callback) after a delay. 
            // Track the callback by key, so if the same callback 
            // is issued again, restart the delay.

            var defaultDelay = 1000;
            delay = delay || defaultDelay;
            if (throttles[key]) {
                $timeout.cancel(throttles[key]);
                throttles[key] = undefined;
            }
            if (immediate) {
                callback();
            } else {
                throttles[key] = $timeout(callback, delay);
            }
        }

        function isNumber(val) {
            // negative or positive
            return /^[-]?\d+$/.test(val);
        }

        function guid() {
            
            function s4() {

                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return function() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                    s4() + '-' + s4() + s4() + s4();
            };
        }

        function textContains(text, searchText) {
            // convert to string to search for numbers
            return text && -1 !== text.toString().toLowerCase().indexOf(searchText.toString().toLowerCase());
        }

        //#region DNA custom function
        function formatjsDate(date, format) {
            if (!format) format = 'mm/dd/yyyy';

            var formattedDate;
            switch (format) {
                default:
                case 'mm/dd/yyyy':
                {
                    formattedDate = (date.getMonth() + 1) + "/" + (date.getDate()) + "/" + (date.getFullYear());
                    break;
                }
                case 'dd/mm/yyyy':
                {
                    formattedDate = (date.getDate()) + "/" + (date.getMonth() + 1) + "/" + (date.getFullYear());
                    break;
                }
            }
            return formattedDate;
        }

        function replaceSpecialCharacters(value, chars) {
            var currentChar;

            for (var i = 0; i < value.toString().length; i++) {
                currentChar = value.toString().charAt(i);
                if (chars.indexOf(currentChar) != -1) {
                    value = value.replace(currentChar, '');
                }
            }
            return value;
        }

        function lowerCaseFirstLetter(value) {
            return value.charAt(0).toLowerCase() + value.slice(1);
        }

        //http://stackoverflow.com/a/11268104/3374718
        function strongPasswordChecker(password) {
            var score = 0;
            if (!password) return "";

            // award every unique letter until 5 repetitions
            var letters = new Object();
            for (var i = 0; i < password.length; i++) {
                letters[password[i]] = (letters[password[i]] || 0) + 1;
                score += 5.0 / letters[password[i]];
            }

            // bonus points for mixing it up
            var variations = {
                digits: /\d/.test(password),
                lower: /[a-z]/.test(password),
                upper: /[A-Z]/.test(password),
                nonWords: /\W/.test(password),
            }

            var variationCount = 0;
            for (var check in variations) {
                variationCount += (variations[check] == true) ? 1 : 0;
            }
            score += (variationCount - 1) * 10;
            
            score = parseInt(score);
            if (score > 80)
                return "strong";
            if (score > 60)
                return "good";
            if (score >= 30)
                return "weak";

            return "";
        }
        //#endregion
    }
})();