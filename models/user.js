const mongoose = require("mongoose");
const crypto = require("crypto");
const config = require("config");

const userSchema = new mongoose.Schema({
  displayName: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  jwt: String,
  role: {
    type: String,
    required: true,
    default: "user"
  }
}, {
  timestamps: true,
  collection: "users"
});

userSchema.virtual("password")
  .set(function (password) {
    if (password !== undefined) {
      if (password.length < 4) {
        this.invalidate("password", "Пароль должен быть минимум 4 символа.");
      }
    }

    if(password) {
      this._plainPassword = password;
      this.salt = crypto.randomBytes(config.crypto.hash.length).toString("base64");
      this.passwordHash = crypto.pbkdf2Sync(
        password,
        this.salt,
        config.crypto.hash.iterations,
        config.crypto.hash.length,
        "sha512"
      ).toString("base64");
    }
    else {
      let error = new Error();
      error.name = "ValidationError";
      error.code = 400;
      error.errors = [{message: "password can't be empty"}];
      throw error;
    }
  })
  .get(function () {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = function (password) {
  if(!password) return false;
  if(!this.passwordHash) return false;

  return crypto.pbkdf2Sync(
    password,
    this.salt,
    config.crypto.hash.iterations,
    config.crypto.hash.length,
    "sha512"
  ).toString("base64") === this.passwordHash;
};

userSchema.statics.publicFields = ["email", "displayName", "_id"];

module.exports = mongoose.model("User", userSchema);
