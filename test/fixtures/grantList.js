module.exports = [
  {role: "moderator", resource: "user", action: "delete", attributes: ["*"], _id: "123456789012345678900001"},
  {role: "moderator", resource: "user", action: "update", attributes: ["*", "!_id"], _id: "123456789012345678900002"},
  {role: "moderator", resource: "user", action: "read", attributes: ["*", "!_id"], _id: "123456789012345678900003"},
  {role: "moderator", resource: "user", action: "create", attributes: ["*", "!_id"], _id: "123456789012345678900004"},
  {role: "moderator", resource: "grant", action: "delete", attributes: ["*"], _id: "123456789012345678900005"},
  {role: "moderator", resource: "grant", action: "update", attributes: ["*", "!_id"], _id: "123456789012345678900006"},
  {role: "moderator", resource: "grant", action: "read", attributes: ["*", "!_id"], _id: "123456789012345678900007"},
  {role: "moderator", resource: "grant", action: "create", attributes: ["*", "!_id"], _id: "123456789012345678900008"},

  {role: "admin", resource: "user", action: "delete", attributes: ["*"], _id: "123456789012345678900011"},
  {role: "admin", resource: "user", action: "update", attributes: ["*", "!_id"], _id: "123456789012345678900012"},
  {role: "admin", resource: "user", action: "read", attributes: ["*", "!_id"], _id: "123456789012345678900013"},
  {role: "admin", resource: "user", action: "create", attributes: ["*", "!_id"], _id: "123456789012345678900014"},
  {role: "admin", resource: "grant", action: "delete", attributes: ["*"], _id: "123456789012345678900015"},
  {role: "admin", resource: "grant", action: "update", attributes: ["*", "!_id"], _id: "123456789012345678900016"},
  {role: "admin", resource: "grant", action: "read", attributes: ["*", "!_id"], _id: "123456789012345678900017"},
  {role: "admin", resource: "grant", action: "create", attributes: ["*", "!_id"], _id: "123456789012345678900018"},

  {role: "user", resource: "user", action: "read", attributes: ["*"], _id: "123456789012345678900009"},
  {
    role: "user", resource: "user", action: "update", attributes: ["*", "!_id"], _id: "123456789012345678900010",
    condition: {
      Fn: "EQUALS",
      args: {"own": true}
    }
  }
];