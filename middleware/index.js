const bodyParser = require("koa-bodyparser");
const passport = require("koa-passport");
const cors = require("@koa/cors");
const logger = require("koa-logger");

module.exports = [
  logger(),
  cors(),
  bodyParser({
    extendTypes: {
      json: ["text/plain"] // will parse text/plain type body as a JSON string
    }
  }),
  passport.initialize()
];
