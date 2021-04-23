const Koa = require("koa");
const app = module.exports = new Koa();

require("lib/initializers/mongoose");
require("lib/initializers/passport");
require("lib/initializers/accessControl");

//const grantList = require("test/fixtures/grantList");
//const Grant = require("models/grant");
//Grant.create(grantList)
//  .then(async () => {
//    let grantList = await Grant.find({});
//    console.log(grantList);
//  });

const middleware = require("middleware");
middleware.forEach(handler => app.use(handler));

const router = require("routes");

app.use(router.routes());
