var passportLocalSequelize = require('passport-local-sequelize');
var crypto = require("crypto");
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
	last_fetch:DataTypes.DATE,
    }, {
	classMethods: {
	    associate: function(models) {
	    }
	}, 
	hooks: {
	    beforeCreate: function(user, fn) {

	    }
	}, 
	instanceMethods: {
	    import:require("../../lib/import"),
	    onUpdate:require("../../lib/import"),
	}
    });
    passportLocalSequelize(User);
    return User;
};

module.exports = User;