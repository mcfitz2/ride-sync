var passportLocalSequelize = require('passport-local-sequelize');
var crypto = require("crypto");
var moment = require("moment");
var Strava = require("strava");
var Moves = require("moves");
var Prowl = require("prowljs");
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
	prowl_enabled:{
	    type:DataTypes.BOOLEAN,
	    defaultValue:true,
	    allowNull:false,
	},
	fetch_enabled:{
	    type:DataTypes.BOOLEAN,
	    defaultValue:true,
	    allowNull:false,
	},
	units: {
	    type: DataTypes.ENUM("metric", "imperial"),
	    defaultValue:"imperial",
	    allowNull:false,
	}
	
    }, {
	classMethods: {
	    associate: function(models) {
		User.hasMany(models.Ride);
	    }
	}, 
	instanceMethods: {
	    sendProwl:function(event, message, params, callback) {
		
		if (arguments.length == 3) {
		    callback = params;
		}
		if (this.prowl_enabled) {
		    var self = this;
		    var prowl = new Prowl(process.env.PROWL_PROVIDER_KEY);
		    var options = {
			apikey:self.prowl_api_key,
			event:event, 
			description:message,
			application:"RideSync"
		    };
		    if (params.url) {
			options.url = params.url;
		    }
		    if (params.priority) {
			options.priority = params.priority;
		    }
		    prowl.add(options, function(err) {
			callback(err);
		    });
		} else {
		    callback(null); //if prowl is disabled, just pretend we sent it
		}
	    },
	    getMoves:function() {
		try {
		    return new Moves({
			client_id:    process.env.MOVES_CLIENT_ID,
			client_secret: process.env.MOVES_CLIENT_SECRET,
			access_token: this.moves_access_token,
		    });
		} catch(err) {
		    return null;
		}
	    },
	    getStrava:function() {
		try {
		    return new Strava({
			client_id: process.env.STRAVA_CLIENT_ID,
			client_secret: process.STRAVA_CLIENT_SECRET,
			redirect_uri: process.STRAVA_CALLBACK_URL,
			access_token: this.strava_access_token,
		    });
		} catch(err) {
		    return null;
		}
	    },
	    import:require("../../lib/import"),
	}
    });
    passportLocalSequelize(User);
    return User;
};

module.exports = User;