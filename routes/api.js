var mongojs = require('mongojs'),
    model = require('../model/model');

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

exports.getGameByName = function(req, res, db) {
    db.games.find({name:req.params.name}, function(err, game) {
        if (err || !game) {
            console.log('Game ' + req.params.name + ' not found.');
            res.json(500);
        } else {
            req.json(game, 200);
        }
    });
}

exports.addGame = function(req, res, db) {
    var game = req.body;
    game = model.initialize(game);
    db.games.save(req.body, function(err, game) {
        if (err || !game) {
            console.log("Game not saved!");
            res.json(500);
        } else {
            res.json(game, 201);
        }
    });
};

exports.pauseGame = function(req, res, db) {
    db.games.find({gameId:req.params.id}, function(err, game) {
        if (err || !game || game[0].paused) {
            console.log('Game ' + req.params.id + ' not found or is already paused, returning 400');
            res.json('Game ' + req.params.id + ' not found or is already paused.', 400);
        } else {
            db.games.update({gameId:req.params.id}, {$set:{paused:true}}, function(err, games) {
                if(err || !games) {
                    res.json('Error updating record', 500);
                } else {
                    res.json('', 204);
                }
            });
        }
    });
};

exports.resumeGame = function(req, res, db) {
    db.games.find({gameId:req.params.id}, function(err, game) {
        if (err || !game || !game[0].paused) {
            console.log('Game ' + req.params.id + ' not found or is not paused, returning 400.');
            res.json('Game ' + req.params.id + ' not found or is already paused.', 400);
        } else {
            db.games.update({gameId:req.params.id}, {$set:{paused:false}}, function(err, games) {
                if(err || !games) {
                    res.json('Error updating record', 500);
                } else {
                    res.json('', 204);
                }
            });
        }
    });
};

exports.joinGame = function(req, res, db) {
    var socketId = req.body.playerId;
    db.games.find({gameId:req.params.id}, function(err, games) {
        if(err || !games || games[0].players.indexOf(socketId) != -1) {
            console.log('Game ' + req.params.id + ' not found or player ' + socketId + ' is already in the game, returning 400');
            res.json('Game ' + req.params.id + ' not found or player ' + socketId + ' is already in the game', 400);
        } else {
            db.games.update({gameId:req.params.id}, {$push:{players:socketId}}, function(err, games) {
                if(err || !games) {
                    res.json('Error updating record', 500);
                } else {
                    res.json('', 204);
                }
            });
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
            res.json(204);
        }
    });
};

exports.removeExpiredGames = function(req, res, db) {
    db.games.find({}, function(err, games) {
        if (err || !games) {
            res.json(500);
        } else {
            games.forEach(function(game) {
                if (model.isExpired(game)) {
                    deleteGameInternal(game.gameId, db);
                }
            });
            res.json(204);
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

exports.alertUsersInGame = function(req, res, db, sockets) {
    db.games.find({gameId:req.params.id}, function(err, games) {
        if (!err) {
            games.forEach(function(game) {
                game.players.forEach(function(player) {
                    if(sockets[player]) {
                        sockets[player].emit('gamePaused', {msg:'fooawesomemessage'});    
                    }
                });
            });
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