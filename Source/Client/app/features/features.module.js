(function() {
    'use strict';

    angular.module('app.features', [
        'highcharts-ng',        // HighCharts https://github.com/pablojim/highcharts-ng
        'wj',                   // Wijmo 5 http://demos.componentone.com/wijmo/5/Angular/FlexGridIntro/FlexGridIntro/
        //'kendo.directives',   // KendoUI http://kendo-labs.github.io/angular-kendo/

        'xeditable',            // editable elements http://vitalets.github.io/x-editable/

        'angularFileUpload',     // Angular File Upload https://github.com/nervgh/angular-file-upload
        'angularPayments'       // https://github.com/laurihy/angular-payments/blob/master/example/index.html
    ]).config(function () {
        Stripe.setPublishableKey('pk_test_GDSWvAoMevu2mF0oOCmUNTrF');
    });
}());