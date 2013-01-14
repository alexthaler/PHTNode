var express = require('express'),
    moment = require('moment'),
    socket = require('socket.io'),
    http = require('http');

var app = express(),
    server = http.createServer(app),
    io = socket.listen(server);

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);

    redis.auth(rtg.auth.split(":")[1]); 
} else {
    var redis = require("redis").createClient();
}

redis.on("error", function (err) {
    console.log("Error " + err);
});

app.get('/game/:id?', function(req, res, next) {
  var id = req.params.id;
  responseObj = {};
  if(!id) {
    res.send('game not found!');
  }   
  redis.get(id, function(err, reply) {
    console.log('found game ' + reply.toString());
    res.send(reply.toString());
  });
  return;
});

app.post('/game', function(req, res) {
  console.log('creating game with name: ' + req.body.name + ', target: ' + req.body.target);
    var name = req.body.name,
        target = req.body.target;
    var game = {};
    game.id = GUID();
    game.start = moment.utc();
    game.name = name;
    game.target = target;
    redis.set(game.id, JSON.stringify(game));
    redis.sadd('currentGameIds', game.id);
    redis.scard('currentGameIds', function(error, reply) {
        if(error) {
            console.log(error);
        }
        var gameStats = {'size':reply, 'id':game.id};
        console.log('sending new gamestats ' + gameStats);
        io.sockets.emit('newgame', gameStats);
    });
    res.send(JSON.stringify(game));
});

app.get('/admin', function(req, res) {
    redis.smembers('currentGameIds', function(error, reply) {
        if(error) {
            console.log('REDIS Error: ' + error);
            throw error;            
        } 
        console.log('ids: ' + reply);
        res.render('admin', {games:reply});
    });
});

app.put('/game/:id/complete', function(req, res) {

});

function GUID () {
    var S4 = function () {
        return Math.floor(
                Math.random() * 0x10000 /* 65536 */
            ).toString(16);
    };

    return (
            S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        );
}

var port = process.env.PORT || 5000;
server.listen(port, function() {
  console.log("Listening on " + port);
});