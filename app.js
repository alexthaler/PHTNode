var express = require('express'),
    mongojs = require('mongojs'),
    moment = require('moment'),
    api = require('./routes/api');

var databaseUrl = "pht-database";
var collections = ["games"];
var db = mongojs.connect(databaseUrl, collections);

var app = express();
var environment = require('./config/environment')(app, express);

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

app.get('/api/games', function(req, res) {
    api.allGames(req, res, db);
});

app.post('/api/game', function (req, res) {
    if(isEmptyObject(req.body)) {
        console.log(req.body + " is not valid json.  Sending 400.");
        res.json(400);
    }
    api.addGame(req, res, db);
});

app.put('/api/game', function (req, res) {
    if(isEmptyObject(req.body)) {
        console.log(req.body + " is not valid json.  Sending 400.");
        res.json(400);
    }
    db.games.update(req.body, function(err, game) {
        if (err || !game) {
            console.log("Game not saved!");
            res.json(500);
        } else {
            res.json(game, 204)
        }
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});