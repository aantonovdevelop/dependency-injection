"use strict";

const util = require('util');

function logger(instance) {
    const functionHandler = {
        apply: async function (target, thisArg, argumentsList) {
            const name = instance.constructor.name + ':' + target.name;

            console.log(`Start function ${name} with arguments: ${util.inspect(argumentsList)}`);

            let result = target.apply(thisArg, argumentsList);

            if (result instanceof Promise) {
                try {
                    result = await result;
                } catch (err) {
                    console.log(`End function ${name} with rejected error: ${util.inspect(err)}`);

                    return Promise.reject(err);
                }

                console.log(`End function ${name} with resolved result: ${util.inspect(result)}`);

                return Promise.resolve(result);
            }

            console.log(`End function ${name} with result: ${util.inspect(result)}`);

            return result;
        }
    };

    for (let field of Reflect.ownKeys(instance.__proto__)) {
        console.log(`set proxy on ${field}`);

        if (instance[field] instanceof Function) {
            instance[field] = new Proxy(instance[field], functionHandler);
        }
    }
}

module.exports = { logger };