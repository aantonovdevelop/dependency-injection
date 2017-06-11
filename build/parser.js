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
    static parse(config) {
        const blueprintsTable = new BlueprintsTable();
        const instancesTable = new InstancesTable();
        const middlewareTable = new MiddlewareTable();
        const routesTable = new RoutesTable();

        const rawBlueprints = this._getRawBlueprints(config.types);

        for (const rawBlueprint of rawBlueprints) {
            const packages = ConfigParser._convertRawPackages(rawBlueprint.packages, config.packagesPath);
            const dependencies = ConfigParser._convertRawDependencies(rawBlueprint.dependencies, blueprintsTable);

            const blueprint = ConfigParser._convertRawBlueprintToBlueprint(rawBlueprint, instancesTable, dependencies, packages);

            blueprintsTable.set(blueprint.options.name, blueprint.options.type, blueprint);
        }

        const middleware = ConfigParser._convertRawMiddleware(config.middleware, instancesTable);

        for (const mw of middleware) {
            middlewareTable.set(mw.getName(), mw);
        }

        const routes = ConfigParser._convertRawRoutes(config.routes, config.router, instancesTable, middlewareTable);

        for (const route of routes) {
            routesTable.set(route.getName(), route);
        }

        return { blueprintsTable, instancesTable, middlewareTable, routesTable };
    }

    static _convertRawMiddleware(rawMiddleware = [], instTable) {
        const middleware = [];

        for (const mw of rawMiddleware) {
            const componentInfo = mw.func.split('.');

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

    static _convertRawRoutes(rawRoutes = [], router, instTable, mwTable) {
        const routes = [];

        for (const route of rawRoutes) {
            const componentInfo = route.func.split('.');

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

    static _getRawBlueprints(types) {
        const blueprints = [];

        for (const type in types) {
            if (!types.hasOwnProperty(type)) continue;

            if (types[type].path) {
                let tempBps = require(types[type].path).blueprints || [];

                for (const bp of tempBps) {
                    blueprints.push(_convertToRawBlueprint(bp, type, types[type].path));
                }
            }

            for (const bp of types[type].blueprints || []) {
                blueprints.push(_convertToRawBlueprint(bp, type, types[type].path));
            }
        }

        return blueprints;

        function _convertToRawBlueprint(bp, type, typePath) {
            return {
                name: bp.name,
                type: type,
                typePath: typePath,
                deployType: bp.deployType,
                injectType: bp.injectType,
                $constructor: bp.$constructor,
                mock: bp.mock,
                dependencies: bp.dependencies,
                packages: bp.packages
            };
        }
    }

    static _convertRawPackages(rawPackages = [], pkgPath) {
        const packages = [];

        for (const pkg of rawPackages) {
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

    static _convertRawDependencies(rawDependencies = [], bpTable) {
        const dependencies = [];

        for (const rawDependency of rawDependencies) {
            dependencies.push(new Dependency(bpTable, {
                name: rawDependency.name,
                type: rawDependency.type,
                mock: rawDependency.mock,
                instanceName: rawDependency.instanceName
            }));
        }

        return dependencies;
    }

    static _convertRawBlueprintToBlueprint(raw, instTable, dependencies, packages) {
        const constructor = !raw.mock ? raw.$constructor || require(`${raw.typePath}/${raw.name}`) : function () {};

        return new Blueprint(instTable, {
            name: raw.name,
            type: raw.type,
            deployType: raw.deployType,
            injectType: raw.injectType,

            dependencies: dependencies,
            packages: packages,

            $constructor: constructor,

            mock: raw.mock
        });
    }
}

module.exports = ConfigParser;