
var Moves = require("moves");
var Strava = require("strava");
var gpxgen = require("gpx-gen");
var utils = require("./utils.js");
module.exports = function(callback) {
    var ride = this;
    var db = require("../app/models");
    db.User.find(ride.UserId).done(function(err, user) {

	console.log(user.username);
	var moves = new Moves({
	    client_id:    process.env.MOVES_CLIENT_ID,
	    client_secret: process.env.MOVES_CLIENT_SECRET,
	    access_token: user.moves_access_token,
	});
	var strava = new Strava({
	    client_id: process.env.STRAVA_CLIENT_ID,
	    client_secret: process.STRAVA_CLIENT_SECRET,
	    redirect_uri: process.STRAVA_CALLBACK_URL,
	    access_token: user.strava_access_token,
	});
	moves.get("/user/storyline/daily/"+ride.day, {trackPoints:true}, function(err, res, body) {
	    var gpx = gpxgen(utils.reduceDay(body[0]));
	    if (gpx) {
		strava.activities.delete(ride.activity_id, function(err, res) {
		    strava.uploads.upload({
			filename:"test.gpx",
			data_type:"gpx",
			data:gpx,
			wait:true
		    }, function(err, res) {
			var match = /duplicate of activity ([0-9]+)/.exec(res.error);
			if (match) {
			    match = match[1];
			}
			var activity_id = res.activity_id || match;
			console.log(res);
			ride.updateAttributes({activity_id:activity_id, gpx:gpx}).done(function(err, ride) {
			    callback(err);
			});
		    });
		});
	    } else {
		console.log("GPX null");
		callback(null);
	    }
	});
    });
};