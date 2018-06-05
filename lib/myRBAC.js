class RBAC {
  constructor (opts) {
    if(opts) this.init(opts);
  }

  init (roles) {
    if(roles instanceof Array) {
      const grantsObject = {};
      roles.forEach(grant => {
        if(!grantsObject[grant.role]) grantsObject[grant.role] = {can:[]};
        if(!grant.condition) {
          grantsObject[grant.role].can.push(grant.action);
        }
        else {
          grantsObject[grant.role].can.push({
            name: grant.action,
            when (params) {
              const arg1name = Object.keys(grant.condition.args)[0];
              const arg2name = grant.condition.args[arg1name];
              const arg1 = params[arg1name];
              const arg2 = params[arg2name];
              switch (grant.condition.fn) {
                case "EQUALS":
                  return arg1 === arg2;
                case "NOTEQUALS":
                  return arg1 !== arg2;
              }
            }
          });
        }
      });
      roles = grantsObject;
    }

    if (typeof roles !== "object") {
      throw new TypeError("Expected an object as input");
    }

    const map = {};
    Object.keys(roles).forEach(role => {
      map[role] = {
        can: {}
      };
      if (roles[role].inherits) {
        map[role].inherits = roles[role].inherits;
      }
      roles[role].can.forEach(operation => {
        if (typeof operation === "string") {
          map[role].can[operation] = true;
        }
        else if (typeof operation.name === "string" && typeof operation.when === "function") {
          map[role].can[operation.name] = operation.when;
        }
      });
    });

    RBAC.roles = map;
  }

  static async can (role, operation, params, cb = ()=>{}) {
    if (typeof role !== "string") {
      throw new TypeError("Expected first parameter to be string : role");
    }
    if (typeof operation !== "string") {
      throw new TypeError("Expected second parameter to be string : operation");
    }
    if(typeof params === "function"){
      cb = params;
      params = undefined;
    }
    return new Promise((resolvePromise, rejectPromise) => {
      const resolve = val => {cb(val);resolvePromise(val);};
      try {
        const $role = RBAC.roles[role];
        if (!$role) resolve(false);
        if ($role.can[operation]) {
          if (typeof $role.can[operation] !== "function") resolve(true);
          if ($role.can[operation](params)) resolve(true);
        }
        if (!$role.inherits || $role.inherits.length > 1) resolve(false);
        Promise.all($role.inherits.map(childRole => this.can(childRole, operation, params)))
          .then(results => {
            resolve(results.some(result=>result));
          });
      }
      catch (err) {
        cb(err);
        rejectPromise(err);
      }
    });

  }
}

module.exports = RBAC;