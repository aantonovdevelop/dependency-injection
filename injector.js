"use strict";

const path = require('path');

module.exports = function (config) {
    let servicesPath = config.servicesPath || './app/services',
        managersPath = config.managersPath || './app/managers',
        packagesPath = config.packagesPath || `${path.dirname(require.main.filename)}/node_modules/`,

        servicesConfig = config && config.services || require(servicesPath),
        managersConfig = config && config.managers || require(managersPath),

        servicesBlueprintsTable = {},
        managersBlueprintsTable = {};

    servicesConfig.forEach(blueprint => {
        servicesBlueprintsTable[blueprint.name] = blueprint;
    });

    managersConfig.forEach(blueprint => {
        managersBlueprintsTable[blueprint.name] = blueprint;
    });

    let instantiatedServices = instantiateServices({}, servicesConfig);
    let instantiatedManagers = instantiateManagers(managersConfig, instantiatedServices);

    return {
        instantiatedServices,
        instantiatedManagers
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

    function instantiateService(config, services) {
        console.log(`Instantiate service ${config.name}`);

        let service = null;

        if (config.mock) {
            service = config.mock;
        } else if (!services[convertFileNameToFieldName(config.name)]) {
            service = require(`${servicesPath}/${config.name}`);

            if (config.deployType === 'new') {
                let packages = [];

                config.packages.forEach(p => {
                    packages.push(instantiatePackage(p));
                });

                service = new service(...packages);
            } else {
                service = service();

                instantiatePackages(service, config.packages);
            }

            instantiateServices(service, config.services || [], services);
        } else {
            service = services[convertFileNameToFieldName(config.name)];
        }

        return service;
    }

    function instantiateServices(instance, dependencies, services = {}) {
        for (const d of dependencies) {
            let service = null,
                blueprint = servicesBlueprintsTable[d.name];

            blueprint.mock = d.mock;

            service = instantiateService(blueprint, services);

            instance[convertFileNameToFieldName(blueprint.name)] = service;
            services[convertFileNameToFieldName(blueprint.name)] = service;
        }

        return services;
    }

    function instantiateManagers(blueprints, services) {

        let instantiatedManagers = {};

        for (const blueprint of blueprints) {
            console.log(`Instantiate manager ${blueprint.name}`);

            let manager = require(`${managersPath}/${blueprint.name}`);

            if (blueprint.deployType === 'new') {
                let dependencies = [];

                for (let config of blueprint.services) {
                    let service = instantiateService(config, services);

                    dependencies.push(service);
                }

                for (let config of blueprint.packages) {
                    let pkg = instantiatePackage(config)

                    dependencies.push(pkg);
                }

                manager = new manager(...dependencies);
            } else {
                manager = manager();

                instantiateServices(manager, blueprint.services, services);
            }

            instantiatedManagers[convertFileNameToFieldName(blueprint.name)] = manager;
        }

        return instantiatedManagers;
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