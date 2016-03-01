'use strict';
var app = angular.module('yeomanDemoApp');

app.controller('StypeCtrl', function ($scope, $http, socket) {
    $scope.newstype = '';

    // Grab the initial set of available stypes
    $http.get('/api/stypes').success(function (stypes) {
        $scope.stypes = stypes;

        // Update array with any new or deleted items pushed from the socket
        socket.syncUpdates('stype', $scope.stypes, function (event, stype, stypes) {
            // This callback is fired after the stypes array is updated by the socket listeners

        });
    });

    // Clean up listeners when the controller is destroyed
    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('stype');
    });

    // Use our rest api to post a new stype
    $scope.newType = function () {
        $http.post('/api/stypes',
            {
                string: $scope.stringMdl,
                number: $scope.numberMdl,
                date: $scope.dateMdl,
                //buffer: $scope.bufferMdl,
                boolean: $scope.booleanMdl
                //mixed: $scope.mixedMdl,
                //objectId: $scope.objectIdMdl,
                //array: $scope.arrayMdl
            });
    };

    // Delete stype
    $scope.deletestype = function (stype) {
        $http.delete('/api/stypes/' + stype._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('stypes');
    });

    // begin editing a stype, save the original in case of cancel
    $scope.editstype = function (stype) {
        stype.editing = true;
        //$scope.editedstype = $scope.stypes[stype._id];
        //$scope.originalstype = angular.extend({}, $scope.editedstype);
    };

    // update when done editing
    $scope.doneEditing = function (stype) {
        stype.editing = false;
        $http.put('/api/stypes/' + stype._id, stype);
        //$scope.content = stype.content;
    };

    // revert the edited stype back to what it was
    $scope.revertEditing = function (stype) {
        $scope.stypes[stype._id] = $scope.originalstype;
        $scope.doneEditing(stype._id);
    };
});
