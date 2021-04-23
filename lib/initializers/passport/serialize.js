const passport = require("koa-passport");
const User = require("models/user");

passport.serializeUser((user, done) => {
  console.log("serializeUser");
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  console.log("deserializeUser");
  User.find({email}, (err, user) => {
    done(err, user);
  });
});
