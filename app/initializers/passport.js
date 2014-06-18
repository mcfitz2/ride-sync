var db = require("../models")
, MovesStrategy = require('passport-moves').Strategy
, StravaStrategy = require('passport-strava').Strategy;
function callback(req, accessToken, refreshToken, profile, done) {
    console.log(profile);
    var attrs = {};
    attrs[profile.provider+"_id"] = profile.id;
    attrs[profile.provider+"_access_token"] = accessToken;

    req.user.updateAttributes(attrs).done(function(err, user) {
	console.log(err);
	done(err, user);
    });
}

module.exports = function (app) {
    
    app.passport.serializeUser(db.User.serializeUser());
    app.passport.deserializeUser(db.User.deserializeUser());
    app.passport.use(db.User.createStrategy());
    app.passport.use(new MovesStrategy({
	clientID: process.env.MOVES_CLIENT_ID,
	clientSecret: process.env.MOVES_CLIENT_SECRET,
	callbackURL: process.env.MOVES_CALLBACK_URL,
	passReqToCallback:true
    }, callback));
    app.passport.use(new StravaStrategy({
	clientID: process.env.STRAVA_CLIENT_ID,
	clientSecret: process.env.STRAVA_CLIENT_SECRET,
	callbackURL: process.env.STRAVA_CALLBACK_URL,
	passReqToCallback:true
    }, callback));
};
