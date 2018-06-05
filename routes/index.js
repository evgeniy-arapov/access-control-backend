const Router = require("koa-router");
const router = new Router();
const apiRouter = new Router({
  prefix: "/api"
});

const authRouter = require("./auth");
apiRouter.use(authRouter.routes());

const usersRouter = require("./users");
apiRouter.use(usersRouter.routes());

const grantsRouter = require("./grants");
apiRouter.use(grantsRouter.routes());

router.use(apiRouter.routes());

router.get("/", async ctx => {
  ctx.body = "<p style='" +
    "font-size: 50px; " +
    "text-align: center; " +
    "line-height: calc(100vh - 16px);" +
    "vertical-align: middle;" +
    "margin: 0" +
    "'>😁😃😂😆😅 Use the API instead.</p>";
});

module.exports = router;