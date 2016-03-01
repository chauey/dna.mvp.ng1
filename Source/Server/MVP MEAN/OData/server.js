//UPDATED & MODIFIED CODE
var express = require('express');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
var $data = require('jaydata');
window.DOMParser = require('xmldom').DOMParser;
require('q');
var model = require('./model.js');
var app = express();

// store session state in browser cookie
var cookieSession = require('cookie-session');
app.use(cookieSession({
    keys: ['session key']
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser);
app.use(methodOverride);
app.use(errorHandler);
app.use(express.query());

app.use("/test", $data.JayService.OData.Utils.simpleBodyReader());
app.use("/test", $data.JayService.createAdapter($data.Context, function (req, res) {
    return new model.test.Context({ name: "mongoDB", databaseName: "jaydata", address: "localhost", port: 27017 });
}));
app.use("/", express.static(__dirname));


app.listen(8080);