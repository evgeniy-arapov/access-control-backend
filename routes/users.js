const Router = require("koa-router");
const User = require("models/user");
const passport = require("koa-passport");
const ac = require("lib/accessControl");

const router = new Router({
  prefix: "/users"
})
  .use(passport.authenticate("jwt"))
  .get("/", isItAllowedTo("read"), async ctx => {
    let users = await User.find({});
    ctx.body = users.map(user => user.toObject());
  })
  .get("/:userId", isItAllowedTo("read"), async ctx => {
    const user = await User.findById(ctx.params.userId);
    ctx.body = user.toObject();
  })
  .post("/", isItAllowedTo("create"), async ctx => {
    const newUser = await User.create(ctx.request.body);
    ctx.body = newUser.toObject();
  })
  .delete("/:userId", isItAllowedTo("delete"), async ctx => {
    const user = await User.findByIdAndRemove(ctx.params.userId);
    ctx.body = user.toObject();
  })
  .patch("/:userId", isItAllowedTo("update"), async ctx => {
    const userId = ctx.params.userId;
    const newFields = ctx.request.body;
    const changedUser = await User.findByIdAndUpdate(userId, newFields, {new: true});
    ctx.body = changedUser.toObject();
  });

module.exports = router;

function isItAllowedTo (action) {
  return async (ctx, next) => {
    let own = false;
    if (ctx.params.userId) {
      const resource = await User.findById(ctx.params.userId);
      own = ctx.state.user._id.toString() === resource._id.toString();
    }
    const permission = ac.can(ctx.state.user.role).execute(action)
      .with({own}).on("user");

    if (!permission.granted) ctx.throw(403);
    await next();
  };
}