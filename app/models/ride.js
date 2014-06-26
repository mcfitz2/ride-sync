
var Ride = function(sequelize, DataTypes) {
    var Ride = sequelize.define('Ride', {	
	day:{
	    type:DataTypes.STRING(10),
	    primaryKey:true,
	    validate:{
		isDate:true
	    }
	},
	activity_id:DataTypes.INTEGER,
	distance:DataTypes.DECIMAL,
	name:DataTypes.STRING,
	moving_time:DataTypes.BIGINT,
    }, {
	hooks: {
	    beforeCreate:function(ride, fn) {
		var db = require("../models");
		if (ride.UserId && ride.activity_id) {
		    db.User.find(ride.UserId).done(function(err, user) {
			var strava = user.getStrava();
			strava.activities.get(ride.activity_id, function(err, activity) {
			    ride.distance = activity.distance;
			    ride.moving_time = activity.moving_time;
			    ride.name = activity.name;
			    fn(err, ride);
			});
		    });
		} else {
		    fn(null, ride);
		}
	    },
	    beforeUpdate:function(ride, fn) {
		var db = require("../models");
		if ((ride.UserId && ride.activity_id) && !(ride.distance && ride.moving_time && ride.name)){
		    db.User.find(ride.UserId).done(function(err, user) {
			var strava = user.getStrava();
			strava.activities.get(ride.activity_id, function(err, activity) {
			    ride.distance = activity.distance;
			    ride.moving_time = activity.moving_time;
			    ride.name = activity.name;
			    fn(err, ride);
			});
		    });
		} else {
		    fn(null, ride);
		}
	    }
	}, instanceMethods:{
	    refetch: require("../../lib/refetch.js")
	}
    });
    return Ride;
};

module.exports = Ride;