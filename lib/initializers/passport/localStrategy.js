const passport = require("koa-passport");
const LocalStrategy = require("passport-local");
const User = require("models/user");

passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    session: false
  },
  async (email, password, done) => {
    try {
      console.log(email, password);
      const user = await User.findOne({email});
      console.log(user);
      if (!user) { return done(null, false); }
      if (!user.checkPassword(password)) { return done(null, false); }
      return done(null, user);
    }
    catch (err) {
      done(err);
      throw err;
    }
  }
));
