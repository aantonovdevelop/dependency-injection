"use strict";

const { toCamelCase } = require('../utils');

class Package {

    constructor(options) {
        this.options = options;
    }

    create() {
        if (this.options.mock) {
            return this.options.mock;
        }

        const pkg = this.options.isNative ? require(this.options.name) : require(`${this.options.path}/${this.options.name}`);

        if (this.options.callFunction) {
            return pkg[this.options.callFunction.name].apply(pkg, this.options.callFunction.args || []);
        }

        return pkg;
    }

    getName() {
        return this.options.instanceName || toCamelCase(this.options.name);
    }
}

module.exports = Package;