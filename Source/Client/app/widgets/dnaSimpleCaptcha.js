(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dnaSimpleCaptcha', dnaSimpleCaptcha);

    function dnaSimpleCaptcha() {
        // Usage:
        //<dna-simple-captcha valid="captchaValid"></simple-captcha>
        //<div>valid: {{captchaValid}}</div>
        return {
            restrict: 'E',
            scope: { valid: '=' },
            template: '<input ng-model="a.value" ng-show="a.input" style="width:2em; text-align: center;" placeholder="?">' +
                '           <span ng-hide="a.input">{{a.value}}</span>&nbsp;{{operation}}&nbsp;' +
                        '<input ng-model="b.value" ng-show="b.input" style="width:2em; text-align: center;" placeholder="?">' +
                        '<span ng-hide="b.input">{{b.value}}</span>&nbsp;=&nbsp;{{result}}',
            controller: function ($scope, $timeout) {
                var show = Math.random() > 0.5;

                var value = function (max) {
                    return Math.floor(max * Math.random());
                };

                var int = function (str) {
                    return parseInt(str, 10);
                };

                $scope.a = {
                    value: show ? undefined : 1 + value(4),
                    input: show
                };

                $scope.b = {
                    value: !show ? undefined : 1 + value(4),
                    input: !show
                };
                $scope.operation = '+';

                $scope.result = 5 + value(5);

                var a = $scope.a;
                var b = $scope.b;
                var result = $scope.result;

                var checkValidity = function () {
                    if (a.value && b.value) {
                        var calc = int(a.value) + int(b.value);
                        $scope.valid = calc == result;
                    } else {
                        $scope.valid = false;
                    }
                    $timeout(function () {
                        $scope.$apply(); // needed to solve 2 cycle delay problem;
                    }, 0);
                };

                $scope.$watch('a.value', function () {
                    checkValidity();
                });

                $scope.$watch('b.value', function () {
                    checkValidity();
                });
            }
        };
    }
}());