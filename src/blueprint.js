// @flow

"use strict";

const Injector = require('./injector');

const InstancesTable = require('./tables/instances-table');

class Blueprint {
    options: TBlueprint;
    instTable: InstancesTable;

    constructor(instTable: InstancesTable, options: TBlueprint) {
        this.instTable = instTable;
        this.options = options;
    }

    create(): Object {
        if (this.instTable.has(this.options.name, this.options.type)) {
            return this.instTable.get(this.options.name, this.options.type);
        }

        const dependencies: Array<TComponentInstance> = Blueprint._createComponents(this.options.dependencies);
        const packages: Array<TComponentInstance> = Blueprint._createComponents(this.options.packages);

        const components = [...dependencies, ...packages];

        if (this.options.mock) {
            this.instTable.set(this.options.name, this.options.type, this.options.mock);

            const mock: Object = ((this.options.mock: any): Object);

            return Injector.mockBodyInjection(mock, components);
        }

        const instance: Object = Injector.inject(this.options.constructor, components, `${this.options.deployType}-${this.options.injectType}`);

        this.instTable.set(this.options.name, this.options.type, instance);

        return instance;
    }

    static _createComponents(components: Array<IComponent> = []): Array<TComponentInstance> {
        let _components = [];

        for (const component: IComponent of components) {
            _components.push({
                instance: component.create(),
                name: component.getName()
            });
        }

        return _components;
    }
}

module.exports = Blueprint;
