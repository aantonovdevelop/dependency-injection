// @flow

"use strict";

type TBlueprint = {
    name: string,
    type: string,
    deployType: string,

    dependencies: Array<Dependency>,
    packages: Array<Package>,

    constructor: Function,

    mock: ?Object,
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

            return ((this.options.mock: any): Object);
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