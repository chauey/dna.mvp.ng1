// server\auth\local\local.controller.js
'use strict'

// ********************* Mail ***********************
var passport = require('passport');
var jwt = require('jsonwebtoken');
var mail = require('../../mail');
var config = require('../../config/environment');
var User = require('mongoose').model('User');
var auth = require('../auth.service');
// ********************* Mail ***********************


exports.root = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        var error = err || info;
        if (error) return res.json(401, error);
        if (!user) return res.json(404, { message: 'Something went wrong, please try again.' });

        var token = auth.signToken(user._id, user.role);
        res.json({ token: token });

    })(req, res, next)
};

/**
 * Send confirmation mail
 */
exports.sendMailAdressConfirmationMail = function (req, res, next) {
    var userId = req.user._id;
    User.findOne({
        _id: userId
    }, '-salt -hashedPassword', function (error, user) { // don't ever give out the password or salt
        if (error) return next(error);
        if (!user) return res.json(401);
        var mailConfirmationToken = jwt.sign({ user: user._id, email: user.email }, config.secrets.mailConfirmation, { expiresInMinutes: 5 })
        mail.mailConfirmation.sendMail(user, mailConfirmationToken, function () { res.send(200); });
    });
};

/**
* Confirm mail address
*/
exports.confirmMailAddress = function (req, res, next) {
    console.log('Confirmed email address');
    var mailConfirmationToken = req.param('mailConfirmationToken');

    jwt.verify(mailConfirmationToken, config.secrets.mailConfirmation, function (error, data) {
        if (error) return res.send(403);

        if (data.exp < Date.now()) return res.send(403, { message: "The validation token has expired. You should signin and ask for a new one." });

        User.findById(data.user, function (error, user) {
            if (error) return res.send(403, { message: "The validation token is invalid. You should signin and ask for a new one." });
            if (!user) return res.send(403, { message: "The validation token is invalid. You should signin and ask for a new one." });

            user.confirmMail(function () {
                res.json({ token: auth.signToken(user._id) });
            });
        });
    });
};

/**
* Send password reset mail
*/
exports.sendResetMail = function (req, res, next) {
    var email = String(req.query.email);
    console.log('SERVER_CONTROLLER - sendResetMail - server/auth/local/local.controller.js');
    console.log('Send reset email contains password reset token');
    console.log('Reset mail: ' + email);

    User.findOne({ email: email }, function (error, user) {
        if (error) return next(error);
        if (!user) return res.send(403, { message: 'This email address is unknown' });

        var passwordResetToken = jwt.sign({ userId: user._id }, config.secrets.passwordReset, { expiresInMinutes: 60 * 24 })
        mail.passwordReset.sendMail(user, passwordResetToken, function () { res.send(200); });
    });
};

/**
 * Verify reset password token
 */
exports.verifyToken = function (req, res, next) {
    var passwordResetToken = String(req.body.passwordResetToken);
    console.log('SERVER_CONTROLLER - verifyToken - server/auth/local/local.controller.js');
    console.log('Verify password reset token after user clicked _Reset password_ link in email');

    jwt.verify(passwordResetToken, config.secrets.passwordReset, function (error, data) {
        if (error) return res.send(403);
        User.findById(data.userId, function (error, user) {
            if (error) return res.send(403);
            res.json({ token: auth.signToken(user._id) });
        });
    });
};

/**
 * Allow user enter new password
 */
exports.submitPassword = function (req, res, next) {
    var passwordResetToken = String(req.body.passwordResetToken);
    console.log('SERVER_CONTROLLER - submitPassword - server/auth/local/local.controller.js');
    console.log('Allow user enter new password');

    jwt.verify(passwordResetToken, config.secrets.passwordReset, function (error, data) {
        if (error) return res.send(403);
        User.findById(data.userId, function (error, user) {
            if (error) return res.send(403);
            res.json({ token: auth.signToken(user._id) });
        });
    });
};

/**
 * Set new password
 */
exports.setNewPassword = function (req, res, next) {
    var passwordResetToken = String(req.body.passwordResetToken);
    var newPassword = req.body.newPassword;
    console.log('SERVER_CONTROLLER - setNewPassword - server/auth/local/local.controller.js');
    console.log('Set new password ' + newPassword + ' for user account');

    jwt.verify(passwordResetToken, config.secrets.passwordReset, function (error, data) {
        if (error) return res.send(403);
        User.findById(data.userId, function (error, user) {
            if (error) return res.send(403);

            user.password = newPassword;
            user.save(function (error) {
                if (error) return res.send(403);
                res.json({ token: auth.signToken(user._id) });
            });
        });
    });
};