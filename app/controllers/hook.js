var db = require("../models");
module.exports = function(app) {
    app.post("/update", function(req, res) {
	console.log(req.body);
	db.User.find({where:{moves_id:req.body.userId}}).done(function(err, user) {
	    if (user) {
		if (user.fetch_enabled) {
		    res.send(200);
		    user.import(function(err) {
			console.log("Updated", user.id, user.username);
		    });
		}
	    } else {
		console.log("Could not find user");
		res.send(200);
	    }
	});
    });
};