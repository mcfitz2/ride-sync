function isAuthenticated (req, res, next){
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}
module.exports = function(app) {
    app.get('/account', isAuthenticated, function(req, res){
	res.locals.user = req.user;
	res.render('account');
    });
};