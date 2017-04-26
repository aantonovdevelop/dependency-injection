"use strict";

const path = require('path');

module.exports = function (options) {
    const PACKAGES_PATH = options.packagesPath || `${path.dirname(require.main.filename)}/node_modules/`;

    const routers = options.routers;

    let blueprintsTables = {},
        instantiatedDependencies = {};

    for (const type in options.types) {
        if (!options.types.hasOwnProperty(type)) continue;

        const dConfigs = options.types[type].config || require(options.types[type].path);

        blueprintsTables[type] = {};

        for (const blueprint of dConfigs) {
            blueprintsTables[type][blueprint.name] = blueprint;
        }
    }

    for (const type in options.types) {
        if (!options.types.hasOwnProperty(type)) continue;

        const dConfigs = options.types[type].config || require(options.types[type].path);

        instantiateDependencies({}, dConfigs, type);
    }

    return instantiatedDependencies;

    function instantiatePackage(config) {
        console.log(`Instantiate package ${config.name}`);

        let pkg = config.native
            ? require(config.name)
            : require(`${PACKAGES_PATH}${config.name}`);

        if (config.mock) {
            return config.mock;
        } else {
            if (config.callFunction) {
                return pkg[config.callFunction.name].call(...config.callFunction.arguments);
            } else {
                return pkg;
            }
        }
    }

    function instantiateDependencies(instance, dependencies, type) {
        for (const d of dependencies) {
            if (type === 'packages') {
                instance[toCamelCase(d.instanceName || d.name)] = instantiatePackage(d);

                continue;
            }

            let dInstance = null,
                blueprint = blueprintsTables[type][d.name];

            blueprint.mock = d.mock;

            if (!instantiatedDependencies[type]) instantiatedDependencies[type] = {};

            dInstance = instantiateDependency(blueprint, type);

            instantiatedDependencies[type][toCamelCase(d.name)] = dInstance;

            if (instance) instance[toCamelCase(d.name)] = dInstance;

            for (const route of blueprint.routes || []) {
                routers[route.router][route.type](route.url, dInstance[route.method].bind(dInstance));
            }
        }

        return instantiatedDependencies[type];
    }

    function instantiateDependency(config, type) {
        console.log(`Instantiate dependency ${type} ${config.name}`);

        if (config.mock) {
            return config.mock;
        }

        if (type === 'packages') {
            return instantiatePackage(config);
        }

        if (instantiatedDependencies[type][toCamelCase(config.name)]) {
            return instantiatedDependencies[type][toCamelCase(config.name)];
        }

        let dependency = require(`${options.types[type].path}/${config.name}`);

        if (config.deployType === 'new') {
            let dependencies = {};

            for (const type in config.dependencies) {
                if (!config.dependencies.hasOwnProperty(type)) continue;

                for (const d of config.dependencies[type]) {
                    dependencies[toCamelCase(d.instanceName || d.name)] = instantiateDependency(d, type);
                }
            }

            dependency = new dependency(dependencies);

            instantiatedDependencies[type][toCamelCase(config.name)] = dependency;
        } else {
            dependency = dependency();

            for (const type in config.dependencies) {
                if (!config.dependencies.hasOwnProperty(type)) continue;

                instantiateDependencies(dependency, config.dependencies[type], type);
            }
        }

        return dependency;
    }
};

function toCamelCase(name) {
    let result = '';

    name = name.split('-');

    result += name[0];
    name = name.slice(1, name.length);

    name.forEach(s => {
        s = s[0].toUpperCase() + s.slice(1, s.length);

        result += s;
    });

    return result;
}