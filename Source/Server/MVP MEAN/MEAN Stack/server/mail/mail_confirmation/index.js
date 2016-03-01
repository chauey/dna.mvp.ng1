'use strict';

var service = require('./../mail.service.js');

var sendMail = function(user, mailConfirmationToken, callback){

    console.log(user);

    var locals = {
      name:user.name,
      COMPANY: 'angular-fullstack',
      CONFIRMATION_URL : 'http://localhost:9000/confirm/',
      MAIL_CONFIRMATION_TOKEN : mailConfirmationToken 
    };

    service.sendmail('mail_confirmation', user, 'Activation', locals, callback);

  };

exports.sendMail = sendMail;