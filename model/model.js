//Helper methods for the model
var moment = require('moment');
var expiryMinutes = (4 * 60) + 1

exports.isExpired = function(game) {
    var now = moment();
    var minutesDiff = Math.abs(moment(game.started).diff(now, 'minutes'));
    return game.completed || minutesDiff > expiryMinutes;
}