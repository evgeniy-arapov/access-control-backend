const mongoose = require("mongoose");

const conditionSchema = new mongoose.Schema({
  Fn: {
    type: String,
    required: true,
    enum: ["AND", "OR", "NOT", "EQUALS", "NOT_EQUALS", "STARTS_WITH", "LIST_CONTAINS"]
  },
  args: Object
});

const grantSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ["create", "read", "update", "delete", "*"],
    required: true
  },
  attributes: {
    type: [String],
    required: true,
    default: ["*"]
  },
  condition: conditionSchema
});

grantSchema.statics.publicFields = ["role", "resource", "action", "attributes", "condition", "_id"];
conditionSchema.statics.publicFields = ["Fn", "args"];

module.exports = mongoose.model("Grant", grantSchema);