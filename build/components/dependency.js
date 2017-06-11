"use strict";

const Blueprint = require('../blueprint');
const BlueprintsTable = require('../tables/blueprints-table');

const { toCamelCase } = require('../utils');

class Dependency {

    constructor(bpTable, options) {
        this.bpTable = bpTable;
        this.options = options;
    }

    create() {
        return this.options.mock || this.getBlueprint().create();
    }

    getBlueprint() {
        return this.bpTable.get(this.options.name, this.options.type);
    }

    getName() {
        return this.options.instanceName || toCamelCase(this.options.name);
    }
}

module.exports = Dependency;