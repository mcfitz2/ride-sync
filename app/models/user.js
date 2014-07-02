var passportLocalSequelize = require('passport-local-sequelize');
var crypto = require("crypto");
var moment = require("moment");
var Strava = require("strava");
var Moves = require("moves");
var User = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
	username: DataTypes.STRING,
	email: DataTypes.STRING,
	salt: DataTypes.STRING,
	hash: DataTypes.TEXT,
	strava_access_token:DataTypes.STRING,
	moves_access_token:DataTypes.STRING,
	strava_id: DataTypes.INTEGER,
	moves_id: DataTypes.BIGINT,
	prowl_api_key:DataTypes.STRING,
	prowl_enabled:DataTypes.BOOLEAN,
	fetch_enabled:DataTypes.BOOLEAN,
	
    }, {
	classMethods: {
	    associate: function(models) {
		//User.hasMany(models.Ride);
	    }
	}, 
	instanceMethods: {
	    getMoves:function() {
		return new Moves({
		    client_id:    process.env.MOVES_CLIENT_ID,
		    client_secret: process.env.MOVES_CLIENT_SECRET,
		    access_token: this.moves_access_token,
		});
	    },
	    getStrava:function() {
		return new Strava({
		    client_id: process.env.STRAVA_CLIENT_ID,
		    client_secret: process.STRAVA_CLIENT_SECRET,
		    redirect_uri: process.STRAVA_CALLBACK_URL,
		    access_token: this.strava_access_token,
		});
	    },
	    import:require("../../lib/import"),
	}
    });
    passportLocalSequelize(User);
    return User;
};

module.exports = User;