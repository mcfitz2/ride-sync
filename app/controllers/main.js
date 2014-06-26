var db = require("../models");
var moment = require("moment");
function isAuthenticated (req, res, next){
    if (req.isAuthenticated()) {
	res.locals.user = req.user;
        next();
    } else {
        res.redirect("/login");
    }
}
function toHMS(seconds) {
    var hours   = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    seconds = seconds - (hours * 3600) - (minutes * 60);
    var string = "";
    if (hours) {
	if (hours   < 10) {hours   = "0"+hours;}
	string += hours+":";
    }
    if (minutes) {
	if (minutes < 10) {minutes = "0"+minutes;}
	string += minutes+":";
    }
    if (seconds < 10) {seconds = "0"+seconds;}
    string += seconds;
    return string;
}
module.exports = function(app) {
    app.get('/', isAuthenticated, function(req, res){
	res.locals.user = req.user;
	res.redirect('/account');
    });
    app.post("/refetch/:day", isAuthenticated, function(req, res) {
	db.Ride.find({where:{day:req.params.day, UserId:req.user.id}}).done(function(err, ride) {
	    ride.refetch(function(err) {
		if (err) {
		    res.send(500);
		} else {
		    res.send(200);
		}
	    });
	});
    });
    app.get("/rides", isAuthenticated, function(req, res) {
	db.Ride.findAll({
	    where:{
		UserId: req.user.id
	    },
	    order:[["day", "DESC"]],
	}).done(function(err, rides) {
	    if (rides) {
		res.locals.rides = rides.map(function(ride) {
		    ride.distance = Math.round(ride.distance * 0.00621371)/10;
		    ride.time = toHMS(ride.moving_time);
		    return ride;
		});
	    }
	    res.render('rides');
	});
    });
    app.get('/account', isAuthenticated, function(req, res){
	db.Ride.findAll({
	    where:{
		createdAt:{
		    gte: moment().subtract(1, "weeks").toDate()
		}, 
		UserId: req.user.id
	    }, 
	    order:[["day", "DESC"]],
	    limit:10
	}).done(function(err, rides) {
	    if (rides) {
		res.locals.rides = rides;
	    } else {
		res.locals.rides_error = "Could not fetch recent rides";
	    }
	    res.render('account');
	});
    });
};