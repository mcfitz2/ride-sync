var Moves = require("moves");
var moment = require("moment");
var async = require("async");
var Strava = require("strava");
var gpxgen = require("gpx-gen");
var utils = require("./utils.js");

function mkDates(start) {
    var now = moment().zone(-4);
    var weeks = [];
    var current = now;
    while(current >= start) {
	weeks.push(current.format("YYYY-[W]WW"));
	current.subtract(1, "week");
    }
    weeks.push(current.format("YYYY-[W]WW"));
    return weeks;
    
}
function getSegments(moves, last_fetch, callback) {
    console.log("Fetching profile");
    moves.get("/user/profile", {}, function(err, res, body) {
	
	var localZone = -1*body.profile.currentTimeZone.offset/60;
	var first =  moment(body.profile.firstDate, "YYYYMMDD");
	var dates = mkDates(moment(last_fetch || first));
	console.log(dates);
	var today = moment().zone(localZone).set("hours", 0).set("minutes", 0).set("milliseconds", 0).set("seconds", 0);
	var last = last_fetch || first.zone(localZone).set("hours", 0).set("minutes", 0).set("milliseconds", 0).set("seconds", 0);
	async.concat(dates, function(date, callback) {
	    moves.get("/user/storyline/daily/"+date,  {trackPoints:true}, function(err, res, days) {
		async.concat(days, function(day, callback) {
		    var fixedDate = moment(day.date, "YYYYMMDD").zone(localZone);
		    console.log((fixedDate.isBefore(today) && fixedDate.isAfter(last)), fixedDate.format("LLL"), last.format("LLL"), today.format("LLL"));
		    if (fixedDate.isBefore(today) && fixedDate.isAfter(last)) {
			console.log({date:fixedDate.format("YYYY-MM-DD")});//, segments:reduceDay(day)});
			callback(null, {date:fixedDate.format("YYYY-MM-DD"), segments:utils.reduceDay(day)});
		    } else {
			callback(null, null);
		    }
		}, function(err, segments) {
		    callback(err, segments);
		});
	    });
	}, function(err, segments) {
	    callback(err, segments);
	}); 
    });
}
module.exports = function(callback) {
    var user = this;
    var db = require("../app/models");
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
    db.Ride.findAll({where:{UserId:user.id}, order:[['day','DESC']], limit:1}).done(function(err, ride) {
	var last_fetch = ride[0] ? moment(ride[0].day, "YYYY-MM-DD"):null;
	getSegments(moves, last_fetch, function(err, days) {
	    if (err) {
		console.log(err);
		throw err;
	    }
	    console.log("Got data for", days.length, "days");
	    async.eachLimit(days, 2, function(day, callback) {
		var gpx = gpxgen(day.segments);
		if (gpx) {
		    var date = moment(day.date).format("YYYY-MM-DD");
		    db.Ride.find({where:{day:date, UserId:user.id}}).done(function(err, ride) {
			if (!ride) {
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
				db.Ride.create({UserId:user.id, day:date, activity_id:activity_id, gpx:gpx}).done(function(err, ride) {
				    callback(err);
				});
			    });
			} else {
			    callback(null);
			}
		    });
		} else {
		    callback(null);
		}
	    }, function(err) {
		//	    user.updateAttributes({last_fetch:new Date()}).done(function(err) {
		//		callback(err);
		//	    });
	    });
	});
    });
    
};
