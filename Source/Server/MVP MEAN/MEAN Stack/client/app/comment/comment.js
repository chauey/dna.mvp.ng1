'use strict';

angular.module('yeomanDemoApp')
  .config(function ($stateProvider) {
      $stateProvider
        .state('comment',
        {
            url: '/comment',
            templateUrl: 'app/comment/comment.html',
            controller: 'CommentCtrl'
        })
        .state('createComment', {
            url: '/newComment',
            templateUrl: 'app/comment/create.html',
            controller: 'CommentCtrl'
        });
  });