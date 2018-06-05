module.exports = {
  port: 3000,
  dbUri: "mongodb://localhost/nodeRbac",
  crypto: {
    hash: {
      length: 128,
      // may be slow(!): iterations = 12000 take ~60ms to generate strong password
      iterations: process.env.NODE_ENV === "production" ? 12000 : 1
    }
  },
  jwtSecret: "jwt-secret"
};