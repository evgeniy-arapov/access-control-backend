require("should");
const mongoose = require("mongoose");
const app = require("../../app");
const config = require("config");
const User = require("models/user");
const request = require("request-promise").defaults({
  resolveWithFullResponse: true,
  simple: false
});
const jsonWebToken = require("jsonwebtoken");

const rootUrl = `http://localhost:${config.port}/api/auth`;
const {userRoleUser, newUser} = require("../fixtures/users");

describe("Authentication", () => {
  let server = null;
  let jwt = null;

  before(async () => {
    await mongoose.connect(config.dbUri);
    console.log("We are connected to test database!");
    server = app.listen(config.port);
  });

  after(async () => {
    await new Promise(resolve => {mongoose.connection.db.dropDatabase(resolve);});
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    await User.create(userRoleUser);
    jwt = jsonWebToken.sign({
      sub: userRoleUser._id,
      displayName: userRoleUser.displayName || userRoleUser.email
    }, config.jwtSecret);
  });

  afterEach(async () => {
    await new Promise(resolve => {mongoose.connection.db.dropDatabase(resolve);});
  });

  describe("Login POST /api/auth/login", () => {
    it("Should can login user", async () => {
      const response = await request.post(`${rootUrl}/login`, {
        json: true,
        body: {
          email: userRoleUser.email,
          password: userRoleUser.password
        }
      });

      response.statusCode.should.be.equal(200, "statusCode");
      response.body.should.have.type("object");
      response.body.should.have.properties(["jwt", "user"]);
      response.body.user.should.have.type("object");
      response.body.user.should.have.properties(User.publicFields);
    });
  });

  describe("Register POST /api/auth/register", () => {
    it("Should create a new user and login", async () => {
      const response = await request.post(`${rootUrl}/register`, {
        json: true,
        body: newUser
      });

      response.statusCode.should.be.equal(200, "statusCode");
      response.body.should.have.type("object");
      response.body.should.have.properties(["jwt", "user"]);
      response.body.user.should.have.type("object");
      response.body.user.should.have.properties(User.publicFields);
    });
    describe("Register access control", () => {
      beforeEach(async () => {
        await User.findByIdAndUpdate(userRoleUser._id, {jwt});
      });

      it("Should return 403 if already logged in", async () => {
        const response = await request.post(`${rootUrl}/register`, {
          json: true,
          headers: {
            "Authorization": `Bearer ${jwt}`
          },
          body: newUser
        });

        response.statusCode.should.be.equal(403, "statusCode");
      });
    });
  });

  describe("Logout GET /api/auth/logout", () => {
    beforeEach(async () => {
      await User.findByIdAndUpdate(userRoleUser._id, {jwt});
    });

    it("Should logout user", async () => {
      const successRes = await request.get(`${rootUrl}/logout`, {
        json: true,
        headers: {
          "Authorization": `Bearer ${jwt}`
        }
      });
      successRes.statusCode.should.be.equal(200, "statusCode");
      successRes.body.should.have.type("object");
      successRes.body.should.have.property("jwt").which.is.null();
      successRes.body.should.have.property("user").which.have.type("object");
      successRes.body.user.should.have.properties(User.publicFields);

      const failRes = await request.get(`${rootUrl}/logout`, {
        json: true,
        headers: {
          "Authorization": `Bearer ${jwt}`
        }
      });
      failRes.statusCode.should.be.equal(401, "statusCode");
    });
  });
});
