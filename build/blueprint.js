"use strict";

const Injector = require('./injector');

const InstancesTable = require('./tables/instances-table');

class Blueprint {

    constructor(instTable, options) {
        this.instTable = instTable;
        this.options = options;
    }

    create() {
        if (this.instTable.has(this.options.name, this.options.type)) {
            return this.instTable.get(this.options.name, this.options.type);
        }

        const dependencies = Blueprint._createComponents(this.options.dependencies);
        const packages = Blueprint._createComponents(this.options.packages);

        const components = [...dependencies, ...packages];

        if (this.options.mock) {
            this.instTable.set(this.options.name, this.options.type, this.options.mock);

            const mock = this.options.mock;

            return Injector.mockBodyInjection(mock, components);
        }

        const instance = Injector.inject(this.options.$constructor, components, `${this.options.deployType}-${this.options.injectType}`);

        this.instTable.set(this.options.name, this.options.type, instance);

        return instance;
    }

    static _createComponents(components = []) {
        let _components = [];

        for (const component of components) {
            _components.push({
                instance: component.create(),
                name: component.getName()
            });
        }

        return _components;
    }
}

module.exports = Blueprint;