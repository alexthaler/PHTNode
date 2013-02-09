module.exports = function(app, express){
    app.configure(function() {
        app.use(express.logger());
        app.use(express.bodyParser()); 
        app.use(express.static(__dirname + '/../public')); 
    });

    app.configure('development', function() {
        app.use(express.errorHandler({
            dumpExceptions: true,
            showStack: true
        }));
    });

    app.configure('production', function() {
        app.use(express.errorHandler());
    });
};