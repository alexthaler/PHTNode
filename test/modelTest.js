var model = require("../model/model.js"),
    should = require('should'), 
    moment = require('moment');



describe("PHT API", function() {

    it("check completed recognized as expired", function(done) {
        var game = {completed:true}
        model.isExpired(game).should.eql(true);
        done();
    });

    it("check not completed games are not considered expired", function(done) {
        var game = {completed:false}
        model.isExpired(game).should.eql(false);
        done();
    });

    it("check games that were started over 4 hours ago are considered expired", function(done) {
        var game = {completed:false}
        var start = moment().subtract('minutes', (4 * 60) + 2 );
        game.started = start;
        model.isExpired(game).should.eql(true);
        done();
    });

    it("check games that were started less than 4 hours ago are not considered expired", function(done) {
        var game = {completed:false}
        var start = moment().subtract('hours', 1);
        game.started = start;
        model.isExpired(game).should.eql(false);
        done();
    });

    it("check games that are completed and started less than 4 hours ago are considered expired", function(done) {
        var game = {completed:true}
        var start = moment().subtract('hours', 1);
        game.started = start;
        model.isExpired(game).should.eql(true);
        done();    
    });

    it("check games that are completed and started more than 4 hours ago are considered expired", function(done) {
        var game = {completed:true}
        var start = moment().subtract('hours', 5);
        game.started = start;
        model.isExpired(game).should.eql(true);
        done();    
    });

});