(function () {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dnaWidgetClose', dnaWidgetClose);

    function dnaWidgetClose() {
        // Usage:
        // <a data-dna-widget-close></a>
        // Creates:
        // <a data-dna-widget-close="" href="#" class="wclose">
        //     <i class="fa fa-remove"></i>
        // </a>
        var directive = {
            link: link,
            template: '<i class="fa fa-remove"></i>',
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$set('href', '#');
            attrs.$set('wclose');
            element.click(close);

            function close(e) {
                e.preventDefault();
                element.parent().parent().parent().hide(100);
            }
        }
    }
})();