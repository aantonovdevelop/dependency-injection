// @flow

"use strict";

type TBlueprint = {
    name: string,
    type: string,
    deployType: string,
    injectType: string,

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

type TMiddleware = {
    name: string,
    component: {
        type: string,
        name: string,
        func: ?string
    },
    except: ?Array<Object>,
    only: ?Array<Object>
}

type TRoute = {
    url: string,
    func: {
        fromType: string,
        funcName: string
    }
}

type TComponentInstance = {
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
    deployType: string,
    injectType: string,
    constructor: ?Function,
    mock: ?Object,
    dependencies: Array<Object>,
    packages: Array<Object>
}

class Factory {
    constructor() {

    }

    static create(config: Object) {
        const {blueprintsTable, instanceTable} = ConfigParser.parse(config);

        // $FlowFixMe can't find the iterator
        for (const blueprint: Blueprint of blueprintsTable) {
            blueprint.create();
        }

        return instanceTable;
    }
}

class ConfigParser {
    static parse(config: Object) {
        const blueprintsTable = new BlueprintsTable();
        const instanceTable = new InstancesTable();
        const middlewareTable = new MiddlewareTable();

        const rawBlueprints: Array<TRawBlueprint> = this._getRawBlueprints(config.types);

        for (const rawBlueprint: TRawBlueprint of rawBlueprints) {
            const packages: Array<Package> = ConfigParser._convertRawPackages(rawBlueprint.packages, config.packagesPath);
            const dependencies: Array<Dependency> = ConfigParser._convertRawDependencies(rawBlueprint.dependencies, blueprintsTable);

            const blueprint: Blueprint = ConfigParser._convertRawBlueprintToBlueprint(rawBlueprint, instanceTable, dependencies, packages);

            blueprintsTable.set(blueprint.options.name, blueprint.options.type, blueprint);
        }

        return {blueprintsTable, instanceTable};
    }

    static _getRawBlueprints(types: Object): Array<TRawBlueprint> {
        const blueprints: Array<TRawBlueprint> = [];

        for (const type: string in types) {
            if (!types.hasOwnProperty(type)) continue;

            if (types[type].path) {
                let tempBps: Array<Object> = require(types[type].path).blueprints || [];

                for (const bp: Object of tempBps) {
                    blueprints.push(_convertToRawBlueprint(bp, type, types[type].path));
                }
            }

            for (const bp: Object of types[type].blueprints || []) {
                blueprints.push(_convertToRawBlueprint(bp, type, types[type].path));
            }
        }

        return blueprints;

        function _convertToRawBlueprint(bp: Object, type: string, typePath: string): TRawBlueprint {
            return {
                name: bp.name,
                type: type,
                typePath: typePath,
                deployType: bp.deployType,
                injectType: bp.injectType,
                constructor: bp.constructor,
                mock: bp.mock,
                dependencies: bp.dependencies,
                packages: bp.packages
            }
        }
    }

    static _convertRawPackages(rawPackages: Array<Object> = [], pkgPath: string): Array<Package> {
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

    static _convertRawDependencies(rawDependencies: Array<Object> = [], bpTable: BlueprintsTable): Array<Dependency> {
        const dependencies: Array<Dependency> = [];

        for (const rawDependency of rawDependencies) {
            dependencies.push(new Dependency(bpTable, {
                name: rawDependency.name,
                type: rawDependency.type,
                mock: rawDependency.mock
            }));
        }

        return dependencies;
    }

    static _convertRawBlueprintToBlueprint(raw: TRawBlueprint, instTable: InstancesTable, dependencies: Array<Dependency>, packages: Array<Package>): Blueprint {
        return new Blueprint(instTable, {
            name: raw.name,
            type: raw.type,
            deployType: raw.deployType,
            injectType: raw.injectType,

            dependencies: dependencies,
            packages: packages,

            constructor: raw.constructor || ((require(`${raw.typePath}/${raw.name}`): any): Function),

            mock: raw.mock
        });
    }
}

class Formatter {
    static toObject (dependencies: Array<TComponentInstance>): Object {
        let result = {};

        for (const dependency: TComponentInstance of dependencies) {
            result[dependency.name] = dependency.instance;
        }

        return result;
    }

    static toArray (dependencies: Array<TComponentInstance>): Array<any> {
        let result = [];

        for (const dependency: TComponentInstance of dependencies) {
            result.push(dependency.instance);
        }

        return result;
    }
}

class Injector {
    static constructorRestInjection (constructor: Function, components: Array<TComponentInstance>): Object {
        return new constructor(...Formatter.toArray(components));
    }

    static constructorObjectInjection (constructor: Function, components: Array<TComponentInstance>): Object {
        return new constructor(Formatter.toObject(components));
    }

    static constructorBodyInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return Object.assign(new constructor, Formatter.toObject(components));
    }

    static mockBodyInjection(mock: Object, components: Array<TComponentInstance>): Object {
        return Object.assign(mock, Formatter.toObject(components));
    }

    static functionBodyInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return Object.assign(constructor(), Formatter.toObject(components));
    }

    static functionClojureRestInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return constructor(...Formatter.toArray(components));
    }

    static functionClojureObjectInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return constructor(Formatter.toObject(components));
    }

    static inject(constructor: Function, components: Array<TComponentInstance>, type: string): Object {
        switch (type) {
            case 'constructor-rest': {
                return Injector.constructorRestInjection(constructor, components);
            }

            case 'constructor-object': {
                return Injector.constructorObjectInjection(constructor, components);
            }

            case 'constructor-body': {
                return Injector.constructorBodyInjection(constructor, components);
            }

            case 'function-body': {
                return Injector.functionBodyInjection(constructor, components);
            }

            case 'function-rest': {
                return Injector.functionClojureRestInjection(constructor, components);
            }

            case 'function-object': {
                return Injector.functionClojureObjectInjection(constructor, components);
            }

            default: {
                throw new Error('Unknown type of construct or injection');
            }
        }
    }
}

class Middleware implements IComponent {
    options: TMiddleware;
    instTable: InstancesTable;

    constructor (instTable: InstancesTable, options: TMiddleware) {
        this.instTable = instTable;
        this.options = options;
    }

    create(): Function {
        const middleware = (this.options.component.func)
            ? this.instTable.get(this.options.component.name, this.options.component.type)[this.options.component.func]
            : this.instTable.get(this.options.component.name, this.options.component.type);

        if (middleware instanceof Function) {
            return middleware;
        } else {
            throw new Error(`Middleware ${this.options.name} should be a function`);
        }
    }

    getName () {
        return this.options.name;
    }

    isCorrectForUrl (url: string): boolean {
        if (this.options.only instanceof Array) {
            // $FlowFixMe url should be an Object
            return this.options.only.includes(url);
        } else {
            // $FlowFixMe url should be an Object
            return !(this.options.except || []).includes(url);
        }
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

        const dependencies: Array<TComponentInstance> = Blueprint._createComponents(this.options.dependencies);
        const packages: Array<TComponentInstance> = Blueprint._createComponents(this.options.packages);

        const components = [...dependencies, ...packages];

        if (this.options.mock) {
            this.instTable.set(this.options.name, this.options.type, this.options.mock);

            const mock: Object =  ((this.options.mock: any): Object);

            return Injector.mockBodyInjection(mock, components);
        }

        const instance: Object = Injector.inject(this.options.constructor, components, `${this.options.deployType}-${this.options.injectType}`);

        this.instTable.set(this.options.name, this.options.type, instance);

        return instance;
    }


    // $FlowFixMe expecting IComponent instance
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

interface IComponent {
    create(): Object|Function,
    getName(): string
}

class Dependency implements IComponent {
    options: TDependency;
    bpTable: BlueprintsTable;

    constructor (bpTable: BlueprintsTable, options: TDependency) {
        this.bpTable = bpTable;
        this.options = options;
    }

    create() {
        return this.options.mock || this.getBlueprint().create();
    }

    getBlueprint (): Blueprint {
        return this.bpTable.get(this.options.name, this.options.type);
    }

    getName (): string {
        return toCamelCase(this.options.name);
    }
}

class Package implements IComponent {
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
        if (!name) throw new Error(`Name of ${type} instance is undefined`);
        else if (!type) throw new Error(`Type of ${name} instance is undefined`);
        else if (!instance) throw new Error(`Instance of ${name} ${type} is undefined`);

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
        if (!name) throw new Error(`Name of ${type} blueprint is undefined`);
        else if (!type) throw new Error(`Type of ${name} blueprint is undefined`);
        else if (!blueprint) throw new Error(`Blueprint of ${name} ${type} is undefined`);

        this.table.set(name + type, blueprint);
    }

    get (name: string, type: string): Blueprint {
        return ((this.table.get(name + type): any): Blueprint);
    }

    // $FlowFixMe
    [Symbol.iterator]() {
        return this.table.values();
    }
}

class MiddlewareTable {
    table: Map<string, Middleware>;

    constructor () {
        this.table = new Map();
    }

    set (name: string, middleware: Middleware): void {
        if (!name) throw new Error(`Name of middleware is undefined`);

        this.table.set(name, middleware);
    }

    get (name: string): Middleware {
        return ((this.table.get(name): any): Middleware);
    }

    getForUrl (url: string): Array<Middleware> {
        const middleware: Array<Middleware> = [];

        for (const mw: Middleware of this.table.values()) {
            mw.isCorrectForUrl(url) ? middleware.push(mw): null;
        }

        return middleware;
    }

    // $FlowFixMe
    [Symbol.iterator] () {
        return  this.table.entries();
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

module.exports = {Blueprint, BlueprintsTable, Dependency, InstancesTable, Package, Injector, ConfigParser, Factory, Middleware, MiddlewareTable};