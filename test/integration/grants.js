const config = require("config");
const app = require("app");
const mongoose = require("mongoose");
const should = require("should"); // eslint-disable-line
const jsonWebToken = require("jsonwebtoken");
const User = require("models/user");
const Grant = require("models/grant");
const accessControl = require("lib/accessControl");

const rootUrl = `http://localhost:${config.get("port")}/api/grants`;

const grantList = require("../fixtures/grantList");

const {userRoleModerator} = require("../fixtures/users");
const moderatorJwt = jsonWebToken.sign({
  sub: userRoleModerator._id,
  displayName: userRoleModerator.displayName || userRoleModerator.email
}, config.jwtSecret);

const rp = require("request-promise").defaults({
  resolveWithFullResponse: true,
  simple: false,
  headers: {
    "Authorization": `Bearer ${moderatorJwt}`
  }
});

describe("Grants REST API", () => {
  let server = null;

  before(async () => {
    await mongoose.connect(config.dbUri);
    console.log("We are connected to test database!");
    await User.create(Object.assign({}, userRoleModerator, {jwt: moderatorJwt}));
    await Grant.create(grantList);
    accessControl.setGrants(grantList);
    server = app.listen(config.port);
  });

  after(async () => {
    await new Promise(resolve => {mongoose.connection.db.dropDatabase(resolve);});
    await mongoose.connection.close();
    await server.close();
  });

  describe("GET /grants", () => {
    it("Should return list of grants", async () => {
      const response = await rp.get(rootUrl);
      response.statusCode.should.be.eql(200);
    });
  });
  describe("GET /grants/:grantId", () => {
    it("Should return grant by id", async () => {
      const response = await rp.get(`${rootUrl}/${grantList[0]._id}`);
      response.statusCode.should.be.eql(200);
    });
  });
  describe("POST /grants", () => {
    it("Should create grant and add it to accessControl object", async () => {
      const response = await rp.post({
        url: rootUrl,
        json: true,
        body: {role: "user", resource: "user", action: "create", attributes: ["*"], _id: "123456789012345678900000"}
      });
      response.statusCode.should.be.eql(200);
      accessControl.can("user").execute("create").on("user").granted.should.be.ok();
    });
  });
  describe("DELETE /grants/:grantId", () => {
    it("Should delete grant by id", async () => {
      const response = await rp.delete(`${rootUrl}/${grantList[8]._id}`);
      response.statusCode.should.be.eql(200);
      accessControl.can(grantList[8].role).execute(grantList[8].action).on(grantList[8].resource).granted.should.be.false();
    });
  });
  describe("PATCH /grants/:grantId", () => {
    it("Should create grant and add it to accessControl object", async () => {
      const response = await rp.patch({
        url: `${rootUrl}/${grantList[9]._id}`,
        json: true,
        body: {attributes: ["*", "!_id", "!role"]}
      });
      response.statusCode.should.be.eql(200);
      const permission = accessControl.can(grantList[9].role).execute(grantList[9].action).on(grantList[9].resource);
      permission.granted.should.be.ok();
      permission.attributes.should.be.deepEqual(["*", "!_id", "!role"]);
    });
  });
});