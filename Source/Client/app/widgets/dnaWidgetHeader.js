(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dnaWidgetHeader', dnaWidgetHeader);

    function dnaWidgetHeader() {
        //Usage:
        //<div data-dna-widget-header title="vm.map.title"></div>
        var directive = {
            link: link,
            scope: {
                'title': '@',
                'subtitle': '@',
                'rightText': '@',
                'allowCollapse': '@'
            },
            templateUrl: '/app/layout/widgetheader.html',
            restrict: 'A',
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('class', 'widget-head');
        }
    }
})();