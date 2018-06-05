const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");

module.exports = [
  bodyParser(),
  passport.initialize()
];