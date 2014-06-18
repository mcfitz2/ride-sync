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
    }, {
	classMethods: {
	    associate: function(models) {
		Ride.hasMany(models.User);
		models.User.belongsTo(Ride);
	    }
	}, 
	hooks: {
	}
    });
    return Ride;
};

module.exports = Ride;