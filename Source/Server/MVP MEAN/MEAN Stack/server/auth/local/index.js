'use strict';

var express = require('express');
var controller = require('./local.controller');
var auth = require('../auth.service');
var router = express.Router();

// send email address confirmation mail
router.get('/mailconfirmation', auth.isAuthenticated(), controller.sendMailAdressConfirmationMail);
// verify email address after user clicked on confirmation link
router.post('/mailconfirmation', controller.confirmMailAddress);

// Send reset email contains password reset token
router.get('/passwordreset', controller.sendResetMail);
// Verify password reset token after user clicked 'Reset password' link in email
router.post('/passwordreset', controller.verifyToken);

// Allow user submit new password
router.get('/resetpassword', controller.submitPassword);
// Set new password for user account
router.post('/resetpassword', controller.setNewPassword);

router.post('/', controller.root);

module.exports = router;