const User = require("../models/User.js");

module.exports.signupPage = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req, res) => {
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const regiterUser = await User.register(newUser, password);
        console.log(regiterUser);
        req.login(regiterUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "user was registered");
        res.redirect("/listings");
        })

    }
    catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderLoginPage = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req, res) => {
    req.flash("success", "welcome to wanderlust");
    let redirectUrl = res.locals.redirectUrl || 'listings';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }

        req.flash("success", "you are logged out!");
        res.redirect("/listings");
    })
}