const Router = require("koa-router");
const router = new Router({
  prefix: "/auth"
});
const passport = require("koa-passport");
const jsonWebToken = require("jsonwebtoken");
const config = require("config");
const User = require("models/user");
const pick = require("lodash/pick");

router.post(
  "/login",

  async (ctx, next) => {
    console.log("before passport auth");
    await next();
  },

  passport.authenticate("local"),

  async ctx => {
    const user = ctx.state.user;
    if (!user) return ctx.throw(401);
    const jwt = getJWT(user);
    await user.update({jwt});

    ctx.body = {jwt, user};
  });

router.post("/register",
  async (ctx, next) => {
    await passport.authenticate("jwt", (err, user, /*info*/) => {
      if (err) throw err;
      if (user) ctx.throw(403);
    })(ctx, next);
    await next();
  },
  async ctx => {
    const user = ctx.request.body;
    if (!user || !user.email || !user.password) return ctx.throw(400);
    const newUser = await User.create(Object.assign({}, pick(user, User.publicFields), {password: user.password}));

    const jwt = getJWT(newUser);
    await newUser.update({jwt});

    ctx.body = {jwt, user: newUser};
  }
);

router.get("/logout", passport.authenticate("jwt"), async ctx => {
  const user = ctx.state.user;
  if (!user) return ctx.throw(401);
  await user.update({jwt: null});
  ctx.body = {jwt: null, user};
});

module.exports = router;

function getJWT (user) {
  console.log(user);
  return jsonWebToken.sign({
    sub: user._id,
    displayName: user.displayName || user.email
  }, config.jwtSecret);
}
