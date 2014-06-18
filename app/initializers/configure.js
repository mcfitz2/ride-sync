var express = require("express");
//var crudify = require("crudify");
var SequelizeStore = require('connect-session-sequelize')(express);
module.exports = function(app) {
    console.log("Configuring Express");
    console.log(__dirname);
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
    app.set('port', process.env.PORT || 30005);
    app.set('views', __dirname+'/../views');
    app.set('view engine', 'html');
    app.engine('html', require("hogan-express"));
//    app.set('layout', 'layout');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({
	store: new SequelizeStore({db:app.db.sequelize}), 
	secret:"secret"
    }));
    app.use(app.passport.initialize());
    app.use(app.passport.session());
    app.use(express.methodOverride());

    app.use(app.router);
    app.use("/public", express.static(__dirname+'/../../public'));
    app.use(function(err, req, res, next){
	res.status(err.status || 500);
	console.log(err.stack);
	res.send(500);
    });    
    app.use(function(req, res, next){
	res.status(404);
	res.type('txt').send('Not found');
    });   
    app.isAuthenticated = function(req, res, next) {
	if (!req.user || !req.user.id) {
            return res.redirect('/login');
	}
	next();
    };
};