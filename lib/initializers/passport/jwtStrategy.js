const passport = require("koa-passport");
const User = require("models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const config = require("config");
const jsonWebToken = require("jsonwebtoken");

let opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtSecret
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
  try {
    console.log(jwt_payload);
    const user = await User.findById(jwt_payload.sub);
    if (!user || !user.jwt) return done(null, false);
    return done(null, user);
  }
  catch (err) {
    done(err, false);
    throw err;
  }
}));
