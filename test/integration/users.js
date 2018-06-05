const config = require("config");
const app = require("../../app");
const mongoose = require("mongoose");
const User = require("models/user");
const Grant = require("models/grant");
const assert = require("assert");
const pick = require("lodash/pick");
const ac = require("lib/accessControl");

const rootUrl = `http://localhost:${config.get("port")}/api/users`;

const {userRoleModerator: execUser, newUser} = require("../fixtures/users");
const changedExecUser = Object.assign({}, execUser, {email: "changedemail@mail.com"});
const grantList = require("../fixtures/grantList");

const jsonWebToken = require("jsonwebtoken");
const jwt = jsonWebToken.sign({
  sub: execUser._id,
  displayName: execUser.displayName || execUser.email
}, config.jwtSecret);

const request = require("request-promise").defaults({
  resolveWithFullResponse: true,
  simple: false,
  headers: {
    "Authorization": `Bearer ${jwt}`
  }
});

describe("User REST API", () => {
  let server = null;
  before(async () => {
    await mongoose.connect(config.dbUri);
    console.log("We are connected to test database!");
    await new Promise(resolve => {mongoose.connection.db.dropDatabase(resolve);});
    await User.create(Object.assign({}, execUser, {jwt}));
    await Grant.create(grantList);
    ac.setGrants(grantList);
    server = app.listen(config.port);
  });

  after(async () => {
    await new Promise(resolve => {mongoose.connection.db.dropDatabase(resolve);});
    await mongoose.connection.close();
    await server.close();
  });

  describe("POST /users", () => {
    it("should create user", async () => {
      const response = await request.post({
        url: rootUrl,
        json: true,
        body: newUser
      });
      let object = response.body;
      assert.equal(response.statusCode, 200, JSON.stringify(object));
      assert.equal(typeof object, "object", "response should be object");
      assert(!(object instanceof Array), "response should be single object, not array");
      assert.deepEqual(object, Object.assign({}, pick(newUser, User.publicFields)), "invalid structure of response");
    });
  });

  describe("GET /users", () => {
    let body = null;

    it("should return right users json string", async () => {
      const response = await request.get(rootUrl);
      assert.equal(response.statusCode, 200, JSON.stringify(response.body));
      body = JSON.parse(response.body);
      assert(body instanceof Array, JSON.stringify(body));
    });

    it("should have length = 2", async () => {
      assert.equal(body.length, 2);
    });

    it("should have right signature", async () => {
      const object = body[1];
      assert.deepEqual(object, Object.assign({}, pick(newUser, User.publicFields)), "invalid structure of response");
    });
  });

  describe("GET /users/:userId", () => {
    it("should reutrn right json string", async () => {
      const response = await request.get(`${rootUrl}/${execUser._id}`);
      assert.equal(response.statusCode, 200, response.body);
      const object = JSON.parse(response.body);
      assert.deepEqual(object, Object.assign({}, pick(execUser, User.publicFields)), "invalid structure of response");
    });
  });

  describe("PATCH /users/:userId", () => {
    it("should change user email", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${execUser._id}`,
        json: true,
        body: {
          email: changedExecUser.email
        }
      });
      assert.equal(response.statusCode, 200, JSON.stringify(response.body));
      assert.deepEqual(response.body, Object.assign({}, pick(changedExecUser, User.publicFields)), "invalid structure of response");
    });
  });

  describe("DELETE /users/:userId", () => {
    it("should remove user", async () => {
      const response = await request.delete(`${rootUrl}/${execUser._id}`);
      assert.equal(response.statusCode, 200, response.body);
      const user = await User.find({_id: execUser._id});
      const object = JSON.parse(response.body);
      assert.deepEqual(object, Object.assign({}, pick(changedExecUser, User.publicFields)), "invalid structure of response");
      assert(!user.length);
    });
  });
});
