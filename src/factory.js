// @flow

"use strict";

const ConfigParser = require('./parser');

class Factory {
    router: Object;

    constructor(router: Object) {
        this.router = router;
    }

    create(config: Object) {
        config.router = this.router || config.router;

        const {blueprintsTable, instancesTable, routesTable} = ConfigParser.parse(config);

        // $FlowFixMe can't find the iterator
        for (const blueprint: Blueprint of blueprintsTable) {
            blueprint.create();
        }

        // $FlowFixMe can't find the iterator
        for (const route: Route of routesTable) {
            route.create();
        }

        return instancesTable;
    }
}

module.exports = Factory;
