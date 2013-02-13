var express = require('express'),
    mongojs = require('mongojs'),
    moment = require('moment'),
    api = require('./routes/api');

var databaseUrl = process.env.MONGOLAB_URI || "mongodb://localhost/pht-database";
var collections = ["games"];
var db = mongojs.connect(databaseUrl, collections);

var app = express();
var environment = require('./config/environment')(app, express);

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

//Get methods

app.get('/api/games', function(req, res) {
    api.allGames(req, res, db);
});

app.get('/api/game/:id', function(req, res) {
    api.getGame(req, res, db);
});

app.get('/api/game/:name', function(req, res) {
    api.getGameByName(req, res, db);
});

//Create Update

app.post('/api/game', function(req, res) {
    if (isEmptyObject(req.body)) {
        console.log(req.body + " is not valid json.  Sending 400.");
        res.json(400);
    }
    api.addGame(req, res, db);
});

app.put('/api/game/:id/complete', function(req, res) {
    if (isEmptyObject(req.body)) {
        console.log(req.body + " is not valid json.  Sending 400.");
        res.json(400);
    }
    api.completeGame(req, res, db);
});

//Delete and Cleanup

app.del('/api/game/:id', function(req, res) {
    api.deleteGame(req, res, db);
});

app.put('/api/games/removecompleted', function(req, res) {
    api.removeExpiredGames(req, res, db);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});