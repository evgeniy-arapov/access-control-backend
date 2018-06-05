const passport = require("koa-passport");
//const User = require("models/user");

passport.serializeUser((user, done) => {
  done(null, user.email);
});

//passport.deserializeUser((email, done) => {
//  User.find({email}, (err, user) => {
//    done(err, user);
//  });
//});