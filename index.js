require("lib/trace");

const config = require("config");

const app = require("./app");
const mongoose = require("mongoose");
mongoose.connect(config.dbUri, {
  poolSize: 5,
  keepAlive: true
});

app.listen(config.port, () => {
  if(process.env.NODE_ENV !== "production")console.log(`Listen on port ${config.port}`);
});
