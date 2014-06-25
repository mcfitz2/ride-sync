var Moves = require("moves");
var moment = require("moment");
var async = require("async");
var Strava = require("strava");
var gpxgen = require("gpx-gen");


function mkDates(start) {
    var now = moment().zone(-4);
    var weeks = [];
    var current = now;
    while(current > start) {
	weeks.push(current.format("YYYY-[W]WW"));
	current.subtract(1, "week");
    }
    return weeks;
    
}
function parseISODate(str) {
    var date = '';
    if (str instanceof Date) {
	return str;
    }
    date += str.substr(0, 4) + '-';
    date += str.substr(4, 2) + '-';
    date += str.substr(6, 2);
    
    if (str.indexOf('T') > -1) {
	date += 'T' + str.substr(9, 2) + ':';
	date += str.substr(11, 2) + ':';
	date += str.substr(13, 2);
	date += str.substr(15);
    }
    
    return new Date(date);
}
function reduceDay(day) {
    if (day.segments && day.segments.length > 0) {
	return day.segments.filter(function(seg) {
	    return seg.type == "move" && seg.activities && seg.activities.length > 0;
	}).map(function(seg) {
	    return seg.activities;
	}).reduce(function(prev, curr, index, arr) {
	    curr.filter(function(act) {
		return act.activity == "cycling";
	    }).forEach(function(el) {
		prev.push(el.trackPoints.map(function(tp) {
		    return {
			lat:tp.lat, 
			lon:tp.lon, 
			timestamp:parseISODate(tp.time),
		    };
		}));
	    });
	    return prev;
	}, []);
	
    }
    return [];
    
}
function getSegments(moves, user, callback) {
    console.log("Fetching profile");
    moves.get("/user/profile", {}, function(err, res, body) {
	
	var localZone = -1*body.profile.currentTimeZone.offset/60;
	var first =  moment(body.profile.firstDate, "YYYYMMDD");
	var dates = mkDates(moment(user.last_fetch || first));
	var today = moment().zone(localZone).set("hours", 0).set("minutes", 0).set("milliseconds", 0).set("seconds", 0);
	var last = moment(user.last_fetch||first).zone(localZone).set("hours", 0).set("minutes", 0).set("milliseconds", 0).set("seconds", 0);
	async.concat(dates, function(date, callback) {
	    moves.get("/user/storyline/daily/"+date,  {trackPoints:true}, function(err, res, days) {
		async.concat(days, function(day, callback) {
		    var fixedDate = moment(day.date, "YYYYMMDD").zone(localZone);
		    console.log((fixedDate.isBefore(today) && fixedDate.isAfter(last)), fixedDate.format("LLL"), last.format("LLL"), today.format("LLL"));
		    if (fixedDate.isBefore(today) && fixedDate.isAfter(last)) {
			console.log({date:fixedDate.format("YYYY-MM-DD")});//, segments:reduceDay(day)});
			callback(null, {date:fixedDate.format("YYYY-MM-DD"), segments:reduceDay(day)});
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
    getSegments(moves, user, function(err, days) {
	if (err) {
	    console.log(err);
	    throw err;
	} else {
	    console.log("Got data for", days.length, "days");
	}
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
	    user.updateAttributes({last_fetch:new Date()}).done(function(err) {
		callback(err);
	    });
	});
    });

};
