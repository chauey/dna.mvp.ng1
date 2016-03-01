(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dnaWip', dnaWip);

    dnaWip.$inject = ['$state'];

    function dnaWip($state) {
        //Usage:
        //<li data-dna-wip
        //wip="vm.wip"
        //routes="vm.routes"
        //changed-event="{{vm.wipChangedEvent}}"
        //        class="nlightblue">
        //</li>
        var wipRouteName = 'Work In Progress';
        var directive = {
            controller: ['$scope', wipController],
            link: link,
            scope: {
                'wip': '=',
                'changedEvent': '@',
                'routes': '='
            },
            template: getTemplate(),
            restrict: 'A',
        };
        return directive;

        // Highlight Work in progress in sidebar
        function link(scope, element, attrs) {
            scope.$watch(wipIsCurrent, function (value) {
                value ? element.addClass('current') : element.removeClass('current');
            });

            function wipIsCurrent() {
                if (!$state.current || !$state.current.title) {
                    return false;
                }

                return $state.current.title.substr(0, wipRouteName.length) === wipRouteName;
            }
        }

        function getTemplate() {
            return '<a href="#{{wipRoute.url}}" >'
                + '<i class="fa fa-asterisk fa-fw" data-ng-class="getWipClass()"></i>'
                + 'Work in Progress ({{wip.length}})</a>';
        }

        function wipController($scope) {
            // Trick to return a TRUE boolean value "!!"
            $scope.wipExists = function () { return !!$scope.wip.length; };
            $scope.wipRoute = undefined;
            $scope.getWipClass = function () {
                return $scope.wipExists() ? 'fa-asterisk-alert fa-fw' : '';
            };

            activate();

            function activate() {
                var eventName = $scope.changedEvent;

                $scope.$on(eventName, function (event, data) {
                    $scope.wip = data.wip;
                });

                $scope.wipRoute = $scope.routes.filter(function (r) {
                    return r.config.title === wipRouteName;
                })[0];
            }
        }
    }
})();