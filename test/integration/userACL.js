const mongoose = require("mongoose");
const app = require("../../app");
const config = require("config");
const Grant = require("models/grant");
const User = require("models/user");
const accessControl = require("lib/accessControl");
const assert= require("assert");

const grantList = require("../fixtures/grantList");
const {userRoleUser, userRoleModerator, newUser} = require("../fixtures/users");

const jsonWebToken = require("jsonwebtoken");
const userJwt = jsonWebToken.sign({
  sub: userRoleUser._id,
  displayName: userRoleUser.displayName || userRoleUser.email
}, config.jwtSecret);

const moderatorJwt = jsonWebToken.sign({
  sub: userRoleModerator._id,
  displayName: userRoleModerator.displayName || userRoleModerator.email
}, config.jwtSecret);


let request = require("request-promise").defaults({
  resolveWithFullResponse: true,
  simple: false
});

const rootUrl = `http://localhost:${config.get("port")}/api/users`;

describe("User Access Control", () => {
  let server = null;

  before(async () => {
    await mongoose.connect(config.dbUri);
    console.log("We are connected to test database!");
    await User.create(Object.assign({}, userRoleUser, {jwt: userJwt}));
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
  
  describe("Guest", () => {
    it("Should can't create new user", async () => {
      const response = await request.post({
        url: rootUrl,
        json: true,
        body: newUser
      });
      assert.equal(response.statusCode, 401);
    });
    it("Should can't read users", async () => {
      const response = await request.get(rootUrl);
      assert.equal(response.statusCode, 401);
    });
    it("Should can't update users", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${userRoleUser._id}`,
        json: true,
        body: {
          email: "newemail@mail.com"
        }
      });
      assert.equal(response.statusCode, 401);
    });
    it("Should can't delete user", async () => {
      const response = await request.delete(`${rootUrl}/${userRoleUser._id}`);
      assert.equal(response.statusCode, 401);
    });
  });
  
  describe("User", () => {
    before(async () => {
      request = request.defaults({
        headers: {
          "Authorization": `Bearer ${userJwt}`
        }
      });
    });
    it("Should can read users", async () => {
      const response = await request.get(rootUrl);
      assert.equal(response.statusCode, 200);
    });
    it("Should can't create new user", async () => {
      const response = await request.post({
        url: rootUrl,
        json: true,
        body: newUser
      });
      assert.equal(response.statusCode, 403);
    });
    it("Should can update own user", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${userRoleUser._id}`,
        json: true,
        body: {
          email: "newemail@mail.com"
        }
      });
      assert.equal(response.statusCode, 200);
    });
    it("Should can't update other users", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${userRoleModerator._id}`,
        json: true,
        body: {
          email: "newemail@mail.com"
        }
      });
      assert.equal(response.statusCode, 403);
    });
    it("Should can't delete user", async () => {
      const response = await request.delete(`${rootUrl}/${userRoleUser._id}`);
      assert.equal(response.statusCode, 403);
    });
  });
  
  describe("Moderator", () => {
    before(async () => {
      request = request.defaults({
        headers: {
          "Authorization": `Bearer ${moderatorJwt}`
        }
      });
    });
    it("Should can read users", async () => {
      const response = await request.get(rootUrl);
      assert.equal(response.statusCode, 200);
    });
    it("Should can create new user", async () => {
      const response = await request.post({
        url: rootUrl,
        json: true,
        body: newUser
      });
      assert.equal(response.statusCode, 200);
    });
    it("Should can update own user", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${userRoleModerator._id}`,
        json: true,
        body: {
          email: "newModeratorEmail@mail.com"
        }
      });
      assert.equal(response.statusCode, 200);
    });
    it("Should can update other user", async () => {
      const response = await request.patch({
        url: `${rootUrl}/${userRoleUser._id}`,
        json: true,
        body: {
          email: "newUserEmail@mail.com"
        }
      });
      assert.equal(response.statusCode, 200);
    });
    it("Should can delete user", async () => {
      const response = await request.delete(`${rootUrl}/${userRoleUser._id}`);
      assert.equal(response.statusCode, 200);
    });
  });
});