"use strict";

class Formatter {
    static toObject(dependencies) {
        let result = {};

        for (const dependency of dependencies) {
            result[dependency.name] = dependency.instance;
        }

        return result;
    }

    static toArray(dependencies) {
        let result = [];

        for (const dependency of dependencies) {
            result.push(dependency.instance);
        }

        return result;
    }
}

module.exports = Formatter;