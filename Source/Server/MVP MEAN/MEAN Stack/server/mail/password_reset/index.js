'use strict';

var service = require('./../mail.service.js');

var sendMail = function(user, passwordResetToken, callback){
    
    var locals = {
      name: user.name,
      COMPANY: 'angular-fullstack',
      PWDRESET_URL : 'http://localhost:9000/pwdreset/',
      PWDRESETTOKEN : passwordResetToken 
    };

    service.sendmail('password_reset', user, 'Password reset', locals, callback);

  };


exports.sendMail = sendMail;
