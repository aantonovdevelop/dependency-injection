// @flow

"use strict";

class Formatter {
    static toObject(dependencies: Array<TComponentInstance>): Object {
        let result = {};

        for (const dependency: TComponentInstance of dependencies) {
            result[dependency.name] = dependency.instance;
        }

        return result;
    }

    static toArray(dependencies: Array<TComponentInstance>): Array<any> {
        let result = [];

        for (const dependency: TComponentInstance of dependencies) {
            result.push(dependency.instance);
        }

        return result;
    }
}

module.exports = Formatter;
