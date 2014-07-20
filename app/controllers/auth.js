var db = require("../models");
var Prowl = require("prowljs");
function ensureLoggedIn() {
    return function (req, res, next) {
	if (!req.user || !req.user.id) {
            return res.redirect('/login');
	}
	next();
    };
}
module.exports = function(app) {
    var prowl = new Prowl(process.env.PROWL_PROVIDER_KEY);
    app.get('/login', function(req, res){
	if (req.user) {
	    res.redirect("/home");
	} else {
	    res.render('login');
	}
    });
    app.get("/register", function(req, res) {
	res.locals.start = true;
	res.render("register");
    });
    app.post('/register', function(req, res) {
	db.User.register(db.User.build({ username : req.body.username, email:req.body.email }), req.body.password, function(err, user) {
		if (err) {
		    console.log(err);
		    return res.render('register', { account : user });
		}
	    app.passport.authenticate('local')(req, res, function () {
		res.redirect('/register/moves');
	    });
	});
    });
    app.post('/login', app.passport.authenticate('local'), function(req, res) {
	res.redirect('/home');
    });

    app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
    });
    app.get('/auth/moves', app.isAuthenticated, 
	    app.passport.authorize(
		'moves',
		{
		    scope: "location activity",
		    callbackURL:"/auth/moves/callback"
		})
	   );
    app.get('/register/moves', app.isAuthenticated, 
	    app.passport.authorize(
		'moves',
		{
		    scope: "location activity",
		    callbackURL:"/register/moves/callback"
		})
	   );
    app.get('/auth/prowl', app.isAuthenticated, prowl.middleware());
    app.get('/auth/prowl/callback', app.isAuthenticated,
	    prowl.middleware(function(req, apiKey, callback) {
		req.user.updateAttributes({prowl_api_key:apiKey}).done(callback);
	    }), function(req, res) {
		res.redirect("/settings");
	    });
    
    app.get('/auth/moves/callback', app.isAuthenticated,
	    app.passport.authorize('moves', { failureRedirect: '/' }),
	    function(req, res) {
		res.redirect('/settings');
	    });
    app.get('/register/moves/callback', app.isAuthenticated,
	    app.passport.authorize('moves', { failureRedirect: '/' }),
	    function(req, res) {
		res.redirect('/register/strava');
	    });
    app.get('/auth/strava', app.isAuthenticated, 
	    app.passport.authorize(
		'strava',
		{
		    scope: "view_private write",
		    callbackURL:"/auth/strava/callback"
		})
	   );
    app.get('/register/strava', app.isAuthenticated, 
	    app.passport.authorize(
		'strava',
		{
		    scope: "view_private write",
		    callbackURL:"/register/strava/callback"
		})
	   );
    
    app.get('/auth/strava/callback', app.isAuthenticated, 
	    app.passport.authorize('strava', { failureRedirect: '/settings' }),
	    function(req, res) {
		
		res.redirect('/settings');
	    });
    app.get('/register/strava/callback', app.isAuthenticated, 
	    app.passport.authorize('strava', { failureRedirect: '/register/strava' }),
	    function(req, res) {
		res.redirect('/home');
	    });
};