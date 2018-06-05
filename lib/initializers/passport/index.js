const passport = require("koa-passport");

require("./serialize");
require("./localStrategy");
require("./jwtStrategy");

module.exports = passport;