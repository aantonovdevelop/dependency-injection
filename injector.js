module.exports = function (config) {
    let servicesConfig = config && config.services || require('./app/services'),
        managersConfig = config && config.managers || require('./app/managers');

    let servicesBlueprintsTable = {},
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
        let pkg = require(config.name);

        if (config.mock) {
            return config.mock;
        } else {
            return pkg[config.callFunction.name].call(...config.callFunction.arguments);
        }
    }

    function instantiatePackages(instance, dependencies) {
        for (const packageConfig of dependencies) {
            instance[convertFileNameToFieldName(packageConfig.instanceName || packageConfig.name)] = instantiatePackage(packageConfig);
        }
    }

    function instantiateServices(instance, dependencies, services = {}) {
        for (const d of dependencies) {
            let service = null,
                blueprint = servicesBlueprintsTable[d.name];

            if (d.mock) {
                service = d.mock;
            } else if (!services[convertFileNameToFieldName(d.name)]) {
                service = require('./app/services/' + blueprint.name);

                if (d.deployType === 'new') {
                    let packages = [];

                    blueprint.packages.forEach(p => {
                        packages.push(instantiatePackage(p));
                    });

                    service = new service(...packages);
                } else {
                    service = service();

                    instantiatePackages(service, blueprint.packages);
                }

                instantiateServices(service, blueprint.services || [], services);
            } else {
                service = services[convertFileNameToFieldName(d.name)];
            }

            instance[convertFileNameToFieldName(blueprint.name)] = service;
            services[convertFileNameToFieldName(blueprint.name)] = service;
        }

        return services;
    }

    function instantiateManagers(blueprints, services) {
        let instantiatedManagers = {};

        for (const blueprint of blueprints) {
            let manager = require('./app/managers/' + blueprint.name)();

            instantiateServices(manager, blueprint.services, services);

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