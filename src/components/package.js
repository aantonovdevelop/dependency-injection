// @flow

"use strict";

const {toCamelCase} = require('../utils');

class Package implements IComponent {
    options: TPackage;

    constructor(options: TPackage) {
        this.options = options;
    }

    create(): any {
        if (this.options.mock) {
            return this.options.mock;
        }

        const pkg = this.options.isNative
            ? require(this.options.name)
            : require(`${this.options.path}/${this.options.name}`);

        if (this.options.callFunction) {
            return pkg[this.options.callFunction.name].apply(pkg, this.options.callFunction.args || []);
        }

        return pkg;
    }

    getName(): string {
        return this.options.instanceName || toCamelCase(this.options.name);
    }
}

module.exports = Package;
