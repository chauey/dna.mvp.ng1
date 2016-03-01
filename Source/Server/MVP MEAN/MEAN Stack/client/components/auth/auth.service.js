'use strict';

angular.module('angularFullstackApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, Local, $localStorage, $q) {
      var currentUser = {};
      if ($localStorage.token) {
          currentUser = User.get();
      }

      return {

          /**
           * Authenticate user and save token
           *
           * @param  {Object}   user     - login info
           * @param  {Function} callback - optional
           * @return {Promise}
           */
          login: function (user, callback) {
              var cb = callback || angular.noop;
              var deferred = $q.defer();

              $http.post('/auth/local', {
                  email: user.email,
                  password: user.password
              }).
                success(function (data) {
                    $localStorage.token = data.token;
                    currentUser = User.get();
                    deferred.resolve(data);
                    return cb();
                }).
                error(function (err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

              return deferred.promise;
          },

          /**
           * Delete access token and user info
           *
           * @param  {Function}
           */
          logout: function () {
              delete $localStorage.token;
              currentUser = {};
          },

          /**
           * Create a new user
           *
           * @param  {Object}   user     - user info
           * @param  {Function} callback - optional
           * @return {Promise}
           */
          createUser: function (user, callback) {
              var cb = callback || angular.noop;

              return User.save(user,
                function (data) {
                    $localStorage.token = data.token;
                    currentUser = User.get();
                    return cb(user);
                },
                function (err) {
                    this.logout();
                    return cb(err);
                }.bind(this)).$promise;
          },

          /**
           * Change password
           *
           * @param  {String}   oldPassword
           * @param  {String}   newPassword
           * @param  {Function} callback    - optional
           * @return {Promise}
           */
          changePassword: function (oldPassword, newPassword, callback) {
              var cb = callback || angular.noop;

              return User.changePassword({ id: currentUser._id }, {
                  oldPassword: oldPassword,
                  newPassword: newPassword
              }, function (user) {
                  return cb(user);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          /**
           * Gets all available info on authenticated user
           *
           * @return {Object} user
           */
          getCurrentUser: function () {
              if (!currentUser && $localStorage.token) return currentUser = User.get();
              return currentUser;
          },

          /**
           * Check if a user is logged in
           *
           * @return {Boolean}
           */
          isLoggedIn: function () {
              return currentUser.hasOwnProperty('role');
          },

          /**
           * Waits for currentUser to resolve before checking if user is logged in
           */
          isLoggedInAsync: function (cb) {
              if (currentUser.hasOwnProperty('$promise')) {
                  currentUser.$promise.then(function () {
                      cb(true);
                  }).catch(function () {
                      cb(false);
                  });
              } else if (currentUser.hasOwnProperty('role')) {
                  cb(true);
              } else {
                  cb(false);
              }
          },

          /**
           * Check if a user is an admin
           *
           * @return {Boolean}
           */
          isAdmin: function () {
              return currentUser.role === 'admin';
          },

          /**
           * Get auth token
           */
          getToken: function () {
              return $localStorage.token;
          },

          /**
           * Confirm mail
           *
           * @param  {String}   mailConfirmationToken
           * @param  {Function} callback    - optional
           * @return {Promise}
           */
          confirmMail: function (mailConfirmationToken, callback) {

              var cb = callback || angular.noop;

              return Local.confirmMail({
                  mailConfirmationToken: mailConfirmationToken
              }, function (data) {
                  $localStorage.token = data.token;
                  currentUser = User.get();
                  return cb(currentUser);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          /**
           * Check if a user's mail is confirmed
           *
           * @return {Boolean}
           */
          isMailconfirmed: function () {
              return currentUser.confirmedEmail;
          },

          /**
           * Confirm mail
           *
           * @param  {Function} callback    - optional
           * @return {Promise}
           */
          sendConfirmationMail: function (callback) {
              var cb = callback || angular.noop;

              return Local.verifyMail(function (user) {
                  return cb(user);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          /**
           * Send Reset password Mail
           *
           * @param  {String}   email address
           * @param  {Function} callback    - optional
           * @return {Promise}
           */
          sendPwdResetMail: function (email, callback) {
              var cb = callback || angular.noop;
              console.log('CLIENT_SERVICE - sendPwdResetMail - client/components/auth/auth.service.js ');
              console.log('CLIENT_SERVICE - password reset email :' + email);
              console.log('CLIENT_SERVICE - Before Local.sendResetMail');
              return Local.sendResetMail({
                  email: email
              }, function (user) {
                  return cb(user);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          /**
           * Change reseted password
           *
           * @param  {String}   passwordResetToken
           * @param  {String}   newPassword
           * @param  {Function} callback    - optional
           * @return {Promise}
           */
          confirmResetedPassword: function (passwordResetToken, callback) {
              debugger;
              var cb = callback || angular.noop;
              console.log('CLIENT_SERVICE - confirmResetedPassword - client/components/auth/auth.service.js ');
              console.log('passwordResetToken: ' + passwordResetToken);
              return Local.verifyToken({
                  passwordResetToken: passwordResetToken
              }, function (data) {
                  $localStorage.token = data.token;
                  currentUser = User.get();
                  return cb(data);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          setNewPassword: function (passwordResetToken, newPassword, callback) {
              debugger;
              var cb = callback || angular.noop;
              console.log('CLIENT_SERVICE - setNewPassword - client/components/auth/auth.service.js ');
              console.log('passwordResetToken: ' + passwordResetToken);
              console.log('new password: ' + newPassword);
              return Local.setNewPassword({
                  passwordResetToken: passwordResetToken,
                  newPassword : newPassword
              }, function (data) {
                  $localStorage.token = data.token;
                  currentUser = User.get();
                  return cb(data);
              }, function (err) {
                  return cb(err);
              }).$promise;
          },

          /**
           * Set session token
           *
           * @param  {String}   session token
           * @return {Promise}
           */
          setSessionToken: function (sessionToken, callback) {
              var cb = callback || angular.noop;
              $localStorage.token = sessionToken;
              currentUser = User.get(cb);
          },
      };
  });
