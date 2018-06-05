const Router = require("koa-router");
const Grant = require("models/grant");
const passport = require("koa-passport");
const ac = require("lib/accessControl");

const router = new Router({
  prefix: "/grants"
})
  .use(passport.authenticate("jwt"))
  .get("/", isItAllowedTo("read"), async ctx => {
    const grantsList = await Grant.find({});
    ctx.body = grantsList.map(grant => grant.toObject());
  })
  .get("/:grantId", isItAllowedTo("read"), async ctx => {
    const grant = await Grant.findById(ctx.params.grantId);
    ctx.body = grant.toObject();
  })
  .post("/", isItAllowedTo("create"), async ctx => {
    const newGrant = await Grant.create(ctx.request.body);
    ac.grant(newGrant.toObject());
    ctx.body = newGrant.toObject();
  })
  .delete("/:grantId", isItAllowedTo("delete"), async ctx => {
    const deletedGrant = await Grant.findByIdAndRemove(ctx.params.grantId);
    const grantList = await Grant.find({});
    const grantListMap = grantList.map(grant => grant.toObject());
    ac.setGrants(grantListMap);
    ctx.body = deletedGrant.toObject();
  })
  .patch("/:grantId", isItAllowedTo("update"), async ctx => {
    const grantId = ctx.params.grantId;
    const newFields = ctx.request.body;
    const changedGrant = await Grant.findByIdAndUpdate(grantId, newFields, {new: true});
    const grantList = await Grant.find({});
    const grantListMap = grantList.map(grant => grant.toObject());
    ac.setGrants(grantListMap);
    ctx.body = changedGrant.toObject();
  });

module.exports = router;

function isItAllowedTo (action) {
  return async (ctx, next) => {
    const permission = ac.can(ctx.state.user.role).execute(action).on("grant");

    if (!permission.granted) ctx.throw(403);
    await next();
  };
}