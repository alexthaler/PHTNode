var express = require('express'),
    mongojs = require('mongojs'),
    moment = require('moment'),
    api = require('./routes/api');

var databaseUrl = process.env.MONGOLAB_URI || "mongodb://localhost/pht-database";
var collections = ["games"];
var db = mongojs.connect(databaseUrl, collections);

var app = express(), 
    server = require('http').createServer(app), 
    io = require('socket.io').listen(server);
var environment = require('./config/environment')(app, express);

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

var stored_sockets = {};
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
        res.json('need game to create yo!', 400);
    }
    api.addGame(req, res, db);
});

app.put('/api/game/:id/complete', function(req, res) {
    api.completeGame(req, res, db);
});

app.put('/api/game/:id/pause', function (req, res) {
    api.pauseGame(req, res, db, stored_sockets);
})

app.put('/api/game/:id/resume', function (req, res) {
    api.resumeGame(req, res, db, stored_sockets);
})

app.put('/api/game/:id/join', function(req, res) {
    currentSession = req.body.playerId;
    api.joinGame(req, res, db);
})

//Delete and Cleanup

app.del('/api/game/:id', function(req, res) {
    api.deleteGame(req, res, db);
});

app.put('/api/games/removecompleted', function(req, res) {
    api.removeExpiredGames(req, res, db);
});

app.get('/api/game/:id/alert', function(req, res) {
    api.alertUsersInGame(req, res, db, stored_sockets);
    res.json(200);
});

io.sockets.on('connection', function (socket) {
    console.log(socket.id);
    stored_sockets[socket.id] = socket;
});

var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});