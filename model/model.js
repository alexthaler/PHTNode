//Helper methods for the model
var moment = require('moment'), 
    uuid = require('node-uuid'),
    expiryMinutes = (4 * 60) + 1;

exports.isExpired = function(game) {
    var now = moment();
    var minutesDiff = Math.abs(moment(game.started).diff(now, 'minutes'));
    return game.completed || minutesDiff > expiryMinutes;
}

exports.initialize = function(game) {
    game.started = moment().format();
    game.gameId = uuid.v1();
    game.completed = false;
    return game;
}