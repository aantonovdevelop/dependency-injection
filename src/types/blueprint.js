// @flow

"use strict";

type TBlueprint = {
    name: string,
    type: string,
    deployType: string,

    dependencies: Array<Dependency>,
    packages: Array<Package>,

    constructor: Function,

    mock: ?Object
}

type TDependency = {
    name: string,
    type: string,
    mock: ?Object
}

type TPackageInstance = {
    name: string,
    instance: any
}

type TDependencyInstance = {
    name: string,
    instance: Object
}

type TPackage = {
    name: string,
    instanceName: ?string,
    path: ?string,
    isNative: ?boolean,
    callFunction: ?{
        name: string,
        args: Array<Object>
    },
    mock: ?any
}

type TRawBlueprint = {
    name: string,
    type: string,
    typePath: string,
    deployType: ?string,
    constructor: ?Function,
    mock: ?Object,
    dependencies: Object,
    packages: Array<Object>
}

class ConfigParser {
    static parse(config: Object) {
        const blueprintsTable = new BlueprintsTable();
        const instanceTable = new InstancesTable();

        const rawBlueprints: Array<TRawBlueprint> = this._getRawBlueprints(config);

        for (const rawBlueprint: TRawBlueprint of rawBlueprints) {
            const packages: Array<Package> = ConfigParser._convertRawPackages(rawBlueprint.packages, config.packagesPath);
            const dependencies: Array<Dependency> = ConfigParser._convertRawDependencies(rawBlueprint.dependencies, blueprintsTable);

            const blueprint: Blueprint = ConfigParser._convertRawBlueprintToBlueprint(rawBlueprint, instanceTable, dependencies, packages);

            blueprintsTable.set(blueprint.options.name, blueprint.options.type, blueprint);
        }
    }

    static _getRawBlueprints(config: Object): Array<TRawBlueprint> {
        const blueprints: Array<TRawBlueprint> = [];

        for (const type: string in config.types) {
            if (!config.types.hasOwnProperty(type)) continue;

            if (config.types[type].path) {
                let tempBps: Array<Object> = require(config.types[type].path).blueprints || [];

                for (const bp: Object of tempBps) {
                    blueprints.push(_convertToRawBlueprint(bp, type, config.types[type].path));
                }
            }

            for (const bp: Object of config.types[type].blueprints || []) {
                blueprints.push(_convertToRawBlueprint(bp, type, config.types[type].path));
            }
        }

        return blueprints;

        function _convertToRawBlueprint(bp: Object, type: string, typePath: string): TRawBlueprint {
            return {
                name: bp.name,
                type: type,
                typePath: typePath,
                deployType: bp.deployType,
                constructor: bp.constructor,
                mock: bp.mock,
                dependencies: bp.dependencies,
                packages: bp.packages
            }
        }
    }

    static _convertRawPackages(rawPackages: Array<Object>, pkgPath: string) {
        const packages: Array<Package> = [];

        for (const pkg: Object of rawPackages) {
            packages.push(new Package({
                name: pkg.name,
                instanceName: pkg.instanceName,
                path: pkgPath,
                isNative: pkg.isNative,
                callFunction: pkg.callFunction,
                mock: pkg.mock
            }));
        }

        return packages;
    }

    static _convertRawDependencies(rawDependencies: Object, bpTable: BlueprintsTable) {
        const dependencies: Array<Dependency> = [];

        for (const type: string in rawDependencies) {
            if (!rawDependencies.hasOwnProperty(type)) continue;

            for (const rawDependency of rawDependencies[type]) {
                dependencies.push(new Dependency(bpTable, {
                    name: rawDependency.name,
                    type: type,
                    mock: rawDependency.mock
                }));
            }
        }

        return dependencies;
    }

    static _convertRawBlueprintToBlueprint(raw: TRawBlueprint, instTable: InstancesTable, dependencies: Array<Dependency>, packages: Array<Package>): Blueprint {
        return new Blueprint(instTable, {
            name: raw.name,
            type: raw.type,
            deployType: raw.deployType,

            dependencies: dependencies,
            packages: packages,

            constructor: raw.constructor || ((require(`${raw.typePath}/${raw.name}`): any): Function),

            mock: raw.mock
        });
    }
}

class Formatter {
    static toObject (dependencies: Array<TDependencyInstance|TPackageInstance>): Object {
        let result = {};

        for (const dependency: TDependencyInstance|TPackageInstance of dependencies) {
            result[dependency.name] = dependency.instance;
        }

        return result;
    }

    static toArray (dependencies: Array<TDependencyInstance|TPackageInstance>): Array<any> {
        let result = [];

        for (const dependency: TDependencyInstance|TPackageInstance of dependencies) {
            result.push(dependency.instance);
        }

        return result;
    }
}

class Injector {
    static constructorRestInjection (constructor: Function, dependencies: Array<TDependencyInstance>, packages: Array<TPackageInstance>): Object {
        return new constructor(...Formatter.toArray(dependencies), ...Formatter.toArray(packages));
    }

    static constructorObjectInjection (constructor: Function, dependencies: Array<TDependencyInstance>, packages: Array<TPackageInstance>): Object {
        const _dependencies = Object.assign(Formatter.toObject(dependencies), Formatter.toObject(packages));

        return new constructor(_dependencies);
    }

    static bodyInjection(constructor: Function, dependencies: Array<TDependencyInstance>, packages: Array<TPackageInstance>): Object {
        const _dependencies = Object.assign(Formatter.toObject(dependencies), Formatter.toObject(packages));

        return Object.assign(new constructor, _dependencies);
    }

    static mockBodyInjection(mock: Object, dependencies: Array<TDependencyInstance>, packages: Array<TPackageInstance>): Object {
        const _dependencies = Object.assign(Formatter.toObject(dependencies), Formatter.toObject(packages));

        return Object.assign(mock, _dependencies);
    }
}

class Blueprint {
    options: TBlueprint;
    instTable: InstancesTable;

    constructor (instTable: InstancesTable, options: TBlueprint) {
        this.instTable = instTable;
        this.options = options;
    }

    create (): Object {
        if (this.instTable.has(this.options.name, this.options.type)) {
            return this.instTable.get(this.options.name, this.options.type);
        }

        const dependencies: Array<TDependencyInstance> = Blueprint._createDependencies(this.options.dependencies);
        const packages: Array<TPackageInstance> = Blueprint._createPackages(this.options.packages);

        if (this.options.mock) {
            this.instTable.set(this.options.name, this.options.type, this.options.mock);

            const mock: Object =  ((this.options.mock: any): Object);

            return Injector.mockBodyInjection(mock, dependencies, packages);
        }

        const instance = Injector.constructorRestInjection(this.options.constructor, dependencies, packages);

        this.instTable.set(this.options.name, this.options.type, instance);

        return instance;
    }

    static _createDependencies(dependencies: Array<Dependency> = []): Array<TDependencyInstance> {
        let _dependencies = [];

        for (const dependency: Dependency of dependencies) {
            _dependencies.push({
                instance: dependency.getMock() || dependency.getBlueprint().create(),
                name: dependency.getName()
            });
        }

        return _dependencies;
    }

    static _createPackages(packages: Array<Package> = []): Array<TPackageInstance> {
        let _packages = [];

        for (const pkg: Package of packages) {
            _packages.push({
                instance: pkg.create(),
                name: pkg.getName()
            });
        }

        return _packages;
    }
}

class Dependency {
    options: TDependency;
    bpTable: BlueprintsTable;

    constructor (bpTable: BlueprintsTable, options: TDependency) {
        this.bpTable = bpTable;
        this.options = options;
    }

    getBlueprint (): Blueprint {
        return this.bpTable.get(this.options.name, this.options.type);
    }

    getMock (): ?Object {
        return this.options.mock;
    }

    getName (): string {
        return toCamelCase(this.options.name);
    }
}

class Package {
    options: TPackage;

    constructor (options: TPackage) {
        this.options = options;
    }

    create (): any {
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

    getName (): string {
        return this.options.instanceName || toCamelCase(this.options.name);
    }
}

class InstancesTable {
    table: Map<string, Object>;

    constructor () {
        this.table = new Map();
    }

    set (name: string, type: string, instance: Object): void {
        this.table.set(name + type, instance);
    }

    get (name: string, type: string): Object {
        return ((this.table.get(name + type): any): Object);
    }

    has (name: string, type: string): boolean {
        return this.table.has(name + type);
    }
}

class BlueprintsTable {
    table: Map<string, Blueprint>;

    constructor () {
        this.table = new Map();
    }

    set (name: string, type: string, blueprint: Blueprint): void {
        this.table.set(name + type, blueprint);
    }

    get (name: string, type: string): Blueprint {
        return ((this.table.get(name + type): any): Blueprint);
    }
}

function toCamelCase(name: string): string {
    let result: string = '';

    name = name.split('-');

    result += name[0];
    name = name.slice(1, name.length);

    name.forEach(s => {
        s = s[0].toUpperCase() + s.slice(1, s.length);

        result += s;
    });

    return result;
}

module.exports = {Blueprint, BlueprintsTable, Dependency, InstancesTable, Package, Injector};