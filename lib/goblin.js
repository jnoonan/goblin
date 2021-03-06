/*
 * Welcome to goblin!
 *
 * goblin is a lightweight CMS designed to serve static pages. It is written
 * entirely in javascript, using Node.js and CouchDB for the server and DB, respectively.
 *
 * Written and Developed by Nick Weingartner (nweingartner@gmail.com)
 *
 * Copyright 2013, Managing Editor Inc (http://www.maned.com/), and released under the GPLv3 (see: README for more details)
 *
 */

var mu = require('mu2'),
    db = require('./couchdb.js'),
    express = require('express'),
    auth = require('./auth.js'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    app = express(),
    utils = require('./utils.js'),
    config = require('./config.js');

//Configure Body Parser
app.configure(function () {
    app.use(express.cookieParser());
    app.use(express.session({
        key: "QAWdefrAQ",
        secret: 'asfyvhq987ertvyweiurytsdfgadekjr4yhtfsdfgt9jfwe3ht987234yh'
    }));
    app.use(express.bodyParser());
    app.use('/gb-admin', require('./routes/gb-admin.js'));
    app.use(app.router);
    //Set up Static File for Components
    app.use(express.static(path.join(__dirname, '../public')));
});

mu.root = path.join(__dirname, '../theme');

//Check for 'page routes', if undefined, then create a default route, if not, then set them
db.get('pages_routes', utils.checkAndSetPageRoutes);

//Check to see if key databases exist, and if not, build the necessary components so goblin can run!
utils.checkAndSetConfig();

//Set up dynamic routes for all pages
app.get('/:page_name', function (req, res) {

    db.get('pages_routes', function (err, doc) {

        if (err) {
            console.log(err);
        }

        var pure_routes = doc.pure_routes,
            requested_page = req.params.page_name,
            page_info = _.findWhere(pure_routes, {
                "url": requested_page
            });

        if (page_info !== undefined) {
            db.get(page_info.id, function compileAndRender(err, doc) {

                if (err) {
                    console.log(err);
                }

                var stream = mu.compileAndRender(doc.theme, doc);
                stream.pipe(res);
            });
        } else {
            res.redirect('/index.html');
        }
    });

});

//Default '/' to index.html
app.get('/', function (req, res) {
    res.redirect('/index.html');
});

app.listen(config.desiredPort, utils.listeningOn(config.desiredPort));