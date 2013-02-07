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

//Default timeout for redis keys will be set to 70s
var defaultTimeout = 60 * 70;

redis.on("error", function (err) {
    console.log("Error " + err);
});

app.get('/game/:id?', function(req, res, next) {
  var id = req.params.id;
  if(!id) {
    res.send(400);
  }
  redis.get('game:'+id, function(err, reply) {
    if(reply == null) {
        res.send(404);
    } else {
        console.log('found game ' + reply.toString());
        res.send(reply.toString());
    }
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
    redis.set('game:'+game.id, JSON.stringify(game));
    redis.expire('game:'+game.id, 10);
    redis.keys('game:*', function(error, reply) {
        if(error) {
            console.log(error);
        }
        var gameStats = {'size':reply.length, 'game':game};
        console.log('sending new gamestats ' + gameStats);
        io.sockets.emit('newgame', gameStats);
    });
    res.send(JSON.stringify(game));
});

app.get('/admin', function(req, res) {
    redis.keys('game:*', function(error, data){
        console.log(data);
        for (var i = 0; i < data.length; i++){
            console.log(i + ' - ' + data[i]);           
        }
        redis.mget(data, function(error, data) {
            console.log('sending games - ' + data);
            res.render('admin', {games:data});
        }); 
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