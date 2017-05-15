// @flow

"use strict";

const Middleware = require('./middleware');

const InstancesTable = require('../tables/instances-table');
const MiddlewareTable = require('../tables/middleware-table');

class Route implements IComponent {
    options: TRoute;
    instTable: InstancesTable;
    middlewareTable: MiddlewareTable;
    router: Object;

    constructor(router: Object, instTable: InstancesTable, middlewareTable: MiddlewareTable, options: TRoute) {
        this.options = options;
        this.instTable = instTable;
        this.middlewareTable = middlewareTable;
        this.router = router;
    }

    create(): Object | Function {
        const component: Object = this.instTable.get(this.options.func.compName, this.options.func.fromType);

        if (!component)
            throw new Error(`Can't resolve component for ${this.options.url}`);

        const middleware = (() => {
            const instances: Array<Function> = [];

            for (const mw: Middleware of this.middlewareTable.getForUrl(this.options.url)) {
                instances.push(mw.create());
            }

            return instances;
        })();


        const func: Function = component[this.options.func.funcName];

        if (!func || !(func instanceof Function))
            throw new Error(`Can't resolve function for ${this.options.url}`);

        this.router[this.options.method](this.options.url, ...(middleware || []), func.bind(component));

        return this.router;
    }

    getName(): string {
        return `${this.options.method}_${this.options.url}`;
    }
}

module.exports = Route;
