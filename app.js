var express = require("express");
var app = express();
var http = require("http");
var fs = require("fs");

var passport = require("passport");
app.passport = passport;
var models_dir = __dirname + '/app/models';
var db = require(models_dir);


db
    .sequelize
    .sync({force: process.argv[2] == "sync"})
    .complete(function(err) {
	app.db = db;
//	console.log(db.models);
	if (err) {
	    throw err[0];
	}
	fs.readdirSync("./app/initializers").forEach(function (file) {
	    if(file[0] === '.' || file[0] === "#") {
		return; 
	    }
	    require("./app/initializers/"+ file)(app);
	});
	fs.readdirSync("./app/controllers").forEach(function (file) {
	    if(file[0] === '.') return; 
	    if (fs.statSync("./app/controllers/"+file).isFile()) {
		require("./app/controllers/"+ file)(app);
	    }
	});
	http.createServer(app).listen(app.get("port"), function(){
	    console.log('Express server listening on port ' + app.get('port'));
	});	
    });