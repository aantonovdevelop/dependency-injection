"use strict";

const path = require('path');

module.exports = function (config) {
    let servicesPath = config.servicesPath,
        managersPath = config.managersPath,
        controllersPath = config.controllersPath,
        packagesPath = config.packagesPath || `${path.dirname(require.main.filename)}/node_modules/`,

        servicesConfig = config && config.services || (servicesPath ? require(servicesPath) : []),
        managersConfig = config && config.managers || (managersPath ? require(managersPath) : []),
        controllersConfig = config && config.controllers || (controllersPath ? require(controllersPath) : []),

        servicesBlueprintsTable = {},
        managersBlueprintsTable = {},
        controllersBlueprintsTable = {};

    servicesConfig.forEach(blueprint => {
        servicesBlueprintsTable[blueprint.name] = blueprint;
    });

    managersConfig.forEach(blueprint => {
        managersBlueprintsTable[blueprint.name] = blueprint;
    });

    controllersConfig.forEach(blueprint => {
        controllersBlueprintsTable[blueprint.name] = blueprint;
    });

    let instantiatedDependencies = {
        services: {
            __path: servicesPath
        },

        managers: {
            __path: managersPath
        },

        controllers: {
            __path: controllersPath
        }
    };

    let instantiatedServices = {},
        instantiatedManagers = {},
        instantiatedControllers = {};

    instantiatedServices = instantiateServices({}, servicesConfig);
    instantiatedManagers = instantiateManagers({}, managersConfig);
    instantiatedControllers = instantiateControllers({}, controllersConfig);

    return {
        instantiatedServices,
        instantiatedManagers,
        instantiatedControllers
    };

    function instantiatePackage(config) {
        console.log(`Instantiate package ${config.name}`);

        let pkg = config.native
            ? require(config.name)
            : require(`${packagesPath}${config.name}`);

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

    function instantiatePackages(instance, dependencies) {
        for (const packageConfig of dependencies) {
            instance[convertFileNameToFieldName(packageConfig.instanceName || packageConfig.name)] = instantiatePackage(packageConfig);
        }
    }

    function instantiateDependency(config, type) {
        console.log(`Instantiate dependency ${type} ${config.name}`);

        if (config.mock) {
            return config.mock;
        }

        if (instantiatedDependencies[type][convertFileNameToFieldName(config.name)]) {
            return instantiatedDependencies[type][convertFileNameToFieldName(config.name)];
        }

        let dependency = require(`${instantiatedDependencies[type].__path}/${config.name}`);

        if (config.deployType === 'new') {
            let dependencies = [];

            (config.managers || []).forEach(m => {
                dependencies.push(instantiateDependency(m, 'managers'));
            });

            (config.services || []).forEach(s => {
                dependencies.push(instantiateDependency(s, 'services'));
            });

            (config.packages || []).forEach(p => {
                dependencies.push(instantiatePackage(p));
            });

            dependency = new dependency(...dependencies);

            instantiatedDependencies[type][convertFileNameToFieldName(config.name)] = dependency;
        } else {
            dependency = dependency();

            instantiatePackages(dependency, config.packages || []);
            instantiateServices(dependency, config.services || [], instantiatedDependencies['services']);
            instantiateManagers(dependency, config.managers || [], instantiatedDependencies['managers']);
        }

        return dependency;
    }

    function instantiateServices(instance, dependencies) {
        for (const d of dependencies) {
            let service = null,
                blueprint = servicesBlueprintsTable[d.name];

            blueprint.mock = d.mock;

            service = instantiateDependency(blueprint, 'services');

            instantiatedServices[convertFileNameToFieldName(d.name)] = service;

            if (instance) instance[convertFileNameToFieldName(d.name)] = service;
        }

        return instantiatedServices;
    }

    function instantiateManagers(instance, dependencies) {
        for (const d of dependencies) {
            let manager = null,
                blueprint = managersBlueprintsTable[d.name];

            blueprint.mock = d.mock;

            manager = instantiateDependency(blueprint, 'managers');

            instantiatedManagers[convertFileNameToFieldName(d.name)] = manager;

            if (instance) instance[convertFileNameToFieldName(d.name)] = manager;
        }

        return instantiatedManagers;
    }

    function instantiateControllers(instance, dependencies) {
        for (const d of dependencies) {
            let controller = null,
                blueprint = controllersBlueprintsTable[d.name];

            blueprint.mock = d.mock;

            controller = instantiateDependency(blueprint, 'controllers');

            instantiatedControllers[convertFileNameToFieldName(d.name)] = controller;

            if (instance) instance[convertFileNameToFieldName(d.name)] = controller;
        }

        return instantiatedControllers;
    }
};

function convertFileNameToFieldName(name) {
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