module.exports = function(app) {
    app.get("/settings", app.isAuthenticated, function(req, res) {
	res.redirect("/settings/account");
    });
    app.get("/settings/:subCat", app.isAuthenticated, function(req, res) {
	res.locals.page = {};
	res.locals.page[req.params.subCat] = true;
	res.locals.useMetric = req.user.units == "metric";
	res.locals.useImperial = req.user.units == "imperial";
res.render("settings");
	
    });
    app.post("/settings/:subCat", app.isAuthenticated, function(req, res) {
	var callback = function(err) {
	    if (err) {
		res.send(500);
	    } else {
		res.redirect("/settings/"+req.params.subCat);
	    }
	};
	switch (req.params.subCat) {
	case "display":
	    	    console.log(req.body);
	    callback(null);

	    break;
	case "notifications":
	    console.log(req.body);
	    callback(null);

	    break;
	case "services":
	    console.log(req.body);
	    callback(null);
	    
	    break;
	case "account":
	    console.log(req.body);
	    callback(null);
	    break;
	}
    });
    
};