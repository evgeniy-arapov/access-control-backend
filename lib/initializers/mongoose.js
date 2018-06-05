const mongoose = require("mongoose");
mongoose.Promise = Promise;

//mongoose.set("debug", true);

mongoose.plugin(schema => {
  if (!schema.options.toObject) schema.options.toObject = {};
  schema.options.toObject.transform = function (doc, ret, options) {
    // transform every document before returning the result
    if(options.private || !schema.statics.publicFields) return ret;
    
    let result = {};
    schema.statics.publicFields.forEach(propName => {
      if(ret[propName] !== undefined) result[propName] = ret[propName];
    });
    return result;
  };
});

module.exports = mongoose;