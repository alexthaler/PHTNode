//Helper methods for the model
var moment = require('moment'), 
    uuid = require('node-uuid'),
    expiryMinutes = (2 * 60) + 1;

exports.isExpired = function(game) {
    var now = moment();
    var minutesDiff = Math.abs(moment(game.started).diff(now, 'minutes'));
    return game.completed || minutesDiff > expiryMinutes;
}

exports.initialize = function(game) {
    if (game.target === undefined ) {
        game.target = 60
    }
    game.started = moment().format();
    game.gameId = uuid.v1().replace(/-/g, "");
    game.completed = false;
    game.paused = false;
    game.players = [];
    return game;
}