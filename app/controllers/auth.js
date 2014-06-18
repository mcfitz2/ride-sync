var db = require("../models");
function ensureLoggedIn() {
    return function (req, res, next) {
	if (!req.user || !req.user.id) {
            return res.redirect('/login');
	}
	next();
    };
}
module.exports = function(app) {

    app.get('/login', function(req, res){
	res.render('login');
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
	res.redirect('/account');
    });

    app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/login');
    });
    app.get('/auth/moves', app.isAuthenticated, 
	    app.passport.authorize(
		'moves',
		{
		    scope: "location activity"
		})
	   );
    
    app.get('/auth/moves/callback', app.isAuthenticated,
	    app.passport.authorize('moves', { failureRedirect: '/' }),
	    function(req, res) {
		console.log(req.user);
		res.redirect('/register/strava');
	    });
    app.get('/auth/strava', app.isAuthenticated, 
	    app.passport.authorize(
		'strava',
		{
		    scope: "view_private write"
		})
	   );
    
    app.get('/auth/strava/callback', app.isAuthenticated, 
	    app.passport.authorize('strava', { failureRedirect: '/' }),
	    function(req, res) {
		console.log(req.user);
		res.redirect('/account');
	    });
    app.get("/register/moves", function(req, res) {
	res.locals.moves = true;
	res.render("register");
    });
    app.get("/register/strava", function(req, res) {
	res.locals.strava = true;
	res.render("register");
    });
};