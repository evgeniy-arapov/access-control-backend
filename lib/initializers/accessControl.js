const Grant = require("models/grant");
const ac = module.exports = require("lib/accessControl");

Grant.find({})
  .then(grantList => {
    const grantListMap = grantList.map(grant => grant.toObject());
    ac.setGrants(grantListMap);
  })
  .catch(err => {
    console.error(err);
  });