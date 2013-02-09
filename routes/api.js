exports.allGames = function (req, res, db) {
    db.games.find({}, function(err, games) {
        if (err || !games) {
            console.log("No games found!");
            res.json(404);  
        } else {
            res.json(games, 200);
        }
    });
};

exports.addGame = function (req, res, db) {
    db.games.save(req.body, function(err, game) {
        if (err || !game) {
            console.log("Game not saved!");
            res.json(500);
        } else {
            res.json(game, 201);
        }
    });
};