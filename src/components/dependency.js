// @flow

"use strict";

const Blueprint = require('../blueprint');
const BlueprintsTable = require('../tables/blueprints-table');

const {toCamelCase} = require('../utils');

class Dependency implements IComponent {
    options: TDependency;
    bpTable: BlueprintsTable;

    constructor(bpTable: BlueprintsTable, options: TDependency) {
        this.bpTable = bpTable;
        this.options = options;
    }

    create() {
        return this.options.mock || this.getBlueprint().create();
    }

    getBlueprint(): Blueprint {
        return this.bpTable.get(this.options.name, this.options.type);
    }

    getName(): string {
        return toCamelCase(this.options.name);
    }
}

module.exports = Dependency;