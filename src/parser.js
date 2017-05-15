// @flow

"use strict";

const BlueprintsTable = require('./tables/blueprints-table');
const InstancesTable = require('./tables/instances-table');
const MiddlewareTable = require('./tables/middleware-table');
const RoutesTable = require('./tables/routes-table');

const Package = require('./components/package');
const Dependency = require('./components/dependency');
const Middleware = require('./components/middleware');
const Route = require('./components/route');

const Blueprint = require('./blueprint');

class ConfigParser {
    static parse(config: Object) {
        const blueprintsTable: BlueprintsTable = new BlueprintsTable();
        const instancesTable: InstancesTable = new InstancesTable();
        const middlewareTable: MiddlewareTable = new MiddlewareTable();
        const routesTable: RoutesTable = new RoutesTable();

        const rawBlueprints: Array<TRawBlueprint> = this._getRawBlueprints(config.types);

        for (const rawBlueprint: TRawBlueprint of rawBlueprints) {
            const packages: Array<Package> = ConfigParser._convertRawPackages(rawBlueprint.packages, config.packagesPath);
            const dependencies: Array<Dependency> = ConfigParser._convertRawDependencies(rawBlueprint.dependencies, blueprintsTable);

            const blueprint: Blueprint = ConfigParser._convertRawBlueprintToBlueprint(rawBlueprint, instancesTable, dependencies, packages);

            blueprintsTable.set(blueprint.options.name, blueprint.options.type, blueprint);
        }

        const middleware: Array<Middleware> = ConfigParser._convertRawMiddleware(config.middleware, instancesTable);

        for (const mw: Middleware of middleware) {
            middlewareTable.set(mw.getName(), mw);
        }

        const routes: Array<Route> = ConfigParser._convertRawRoutes(config.routes, config.router, instancesTable, middlewareTable);

        for (const route: Route of routes) {
            routesTable.set(route.getName(), route);
        }

        return {blueprintsTable, instancesTable, middlewareTable, routesTable};
    }

    static _convertRawMiddleware(rawMiddleware: Array<Object> = [], instTable: InstancesTable): Array<Middleware> {
        const middleware: Array<Middleware> = [];

        for (const mw: Object of rawMiddleware) {
            const componentInfo: Array<string> = mw.func.split('.');

            middleware.push(new Middleware(instTable, {
                name: mw.name,
                component: {
                    type: componentInfo[0],
                    name: componentInfo[1],
                    func: componentInfo[2]
                },
                except: mw.except,
                only: mw.only
            }));
        }

        return middleware;
    }

    static _convertRawRoutes(rawRoutes: Array<Object> = [], router: Object, instTable: InstancesTable, mwTable: MiddlewareTable): Array<Route> {
        const routes: Array<Route> = [];

        for (const route: Object of rawRoutes) {
            const componentInfo: Array<string> = route.func.split('.');

            routes.push(new Route(router, instTable, mwTable, {
                url: route.url,
                method: route.method,
                func: {
                    fromType: componentInfo[0],
                    compName: componentInfo[1],
                    funcName: componentInfo[2]
                }
            }));
        }

        return routes;
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

        for (const rawDependency: Object of rawDependencies) {
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

module.exports = ConfigParser;
