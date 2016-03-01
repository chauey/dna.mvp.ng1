'use strict';
var app = angular.module('yeomanDemoApp');

angular.module('yeomanDemoApp')
  .controller('CommentCtrl', function ($scope, $http, socket) {
      $scope.newComment = '';

      // Grab the initial set of available comments
      $http.get('/api/comments').success(function (comments) {
          $scope.comments = comments;

          // Update array with any new or deleted items pushed from the socket
          socket.syncUpdates('comment', $scope.comments, function (event, comment, comments) {
              // This callback is fired after the comments array is updated by the socket listeners

              // sort the array every time its modified
              comments.sort(function (a, b) {
                  a = new Date(a.date);
                  b = new Date(b.date);
                  return a > b ? -1 : a < b ? 1 : 0;
              });
          });
      });

      // Clean up listeners when the controller is destroyed
      $scope.$on('$destroy', function () {
          socket.unsyncUpdates('comment');
      });

      // Use our rest api to post a new comment
      $scope.addComment = function () {
          $http.post('/api/comments', { content: $scope.newComment });
          $scope.newComment = '';
      };

      // Delete comment
      $scope.deleteComment = function (comment) {
          $http.delete('/api/comments/' + comment._id);
      };

      $scope.$on('$destroy', function () {
          socket.unsyncUpdates('comments');
      });

      // begin editing a comment, save the original in case of cancel
      $scope.editComment = function (comment) {
          comment.editing = true;
          //$scope.editedComment = $scope.comments[comment._id];
          //$scope.originalcomment = angular.extend({}, $scope.editedComment);
      };

      // update when done editing
      $scope.doneEditing = function (comment) {
          comment.editing = false;
          $http.put('/api/comments/' + comment._id, comment);
          //$scope.content = comment.content;
      };

      // revert the edited comment back to what it was
      $scope.revertEditing = function (comment) {
          $scope.comments[comment._id] = $scope.originalcomment;
          $scope.doneEditing(comment._id);
      };
  });

