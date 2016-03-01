(function() {
    'use strict';

    angular
        .module('app.widgets')
        .directive('dnaImgPerson', dnaImgPerson);

    dnaImgPerson.$inject = ['config'];

    function dnaImgPerson(config) {
        //Usage:
        //<img data-dna-img-person="{{s.speaker.imageSource}}"/>
        var basePath = config.imageSettings.imageBasePath;
        var unknownImage = config.imageSettings.unknownPersonImageSource;
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$observe('dnaImgPerson', function (value) {
                value = basePath + (value || unknownImage);
                attrs.$set('src', value);
            });
        }
    }
}());