'use strict';

var express = require('express');

var app = express();

var port = 5000;

app.use(express.static('public'));
app.use(express.static('node_modules'));

app.listen(port, function (err) {
        console.log('running on: ' + port);
        console.log(err);
    });
