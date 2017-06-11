"use strict";

const ConfigParser = require('./parser');

class Factory {

    constructor(router) {
        this.router = router;
    }

    create(config) {
        config.router = this.router || config.router;

        const { blueprintsTable, instancesTable, routesTable } = ConfigParser.parse(config);

        // $FlowFixMe can't find the iterator
        for (const blueprint of blueprintsTable) {
            blueprint.create();
        }

        // $FlowFixMe can't find the iterator
        for (const route of routesTable) {
            route.create();
        }

        return instancesTable;
    }
}

module.exports = Factory;