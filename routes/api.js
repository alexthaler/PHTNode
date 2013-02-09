var uuid = require('node-uuid'),
    moment = require('moment'),
    mongojs = require('mongojs'),
    model = require('/../model/model.js');

exports.allGames = function(req, res, db) {
    db.games.find({}, function(err, games) {
        if (err || !games) {
            console.log("No games found!");
            res.json(404);  
        } else {
            res.json(games, 200);
        }
    });
};

exports.getGame = function(req, res, db) {
    db.games.find({gameId:req.params.id}, function(err, game) {
        if (err || !game) {
            console.log('Game ' + req.params.id + ' not found.');
            res.json(500);
        } else {
            res.json(game, 200);
        }
    });
}

exports.addGame = function(req, res, db) {
    var game = req.body;
    game.started = moment().format();
    game.gameId = uuid.v1();
    game.completed = false;
    db.games.save(req.body, function(err, game) {
        if (err || !game) {
            console.log("Game not saved!");
            res.json(500);
        } else {
            res.json(game, 201);
        }
    });
};

exports.removeExpiredGames = function(req, res, db) {
    db.games.find({}, function(err, games) {
        if (err || !games) {
            res.json(500);
        } else {
            games.forEach(function(game) {
                var now = moment();
                var hourDiff = Math.abs(moment(game.started).diff(now, 'hour'));
                if (game.completed || hourDiff > 4) {
                    deleteGameInternal(game.gameId, db);
                }
            });
            res.json(204);
        }
    });
};

exports.completeGame = function(req, res, db) {
    var game = req.body;
    db.games.update({gameId:req.params.id}, {$set : {completed:true}}, function(err, game) {
        if (err || !game) {
            console.log("Game not saved!");
            res.json(500);
        } else {
            res.json(204)
        }
    });
};

exports.deleteGame = function(req, res, db) {
    db.games.remove({gameId:req.params.id}, function(err, game) {
        if (err || !game) {
            console.log("Error");
            res.json(500);
        } else {
            res.json(game, 204);
        }
    });
};

deleteGameInternal = function(id, db) {
    db.games.remove({gameId:id}, function(err, game) {
        if (err || !game) {
            console.log('Error deleting id ' + id);
        } else {
            console.log('Deleted game with id ' + id)
        }
    });
};