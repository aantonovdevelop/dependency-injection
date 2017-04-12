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

    let instantiatedServices = {};
    let instantiatedManagers = instantiateManagers(managersConfig, instantiatedServices);

    return {
        instantiatedServices,
        instantiatedManagers
    };

    function instantiateServices(instance, dependencies, services) {
        dependencies.forEach(d => {
            let service = null,
                blueprint = servicesBlueprintsTable[d.name];

            if (d.mock) {
                service = d.mock;
            } else if (!services[convertFileNameToFieldName(d.name)]) {
                service = require('./app/services/' + blueprint.name)();

                instantiatePackages(service, blueprint.packages);
                instantiateServices(service, blueprint.services || [], services);
            } else {
                service = services[convertFileNameToFieldName(d.name)];
            }

            instance[convertFileNameToFieldName(blueprint.name)] = service;
            services[convertFileNameToFieldName(blueprint.name)] = service;
        });
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

function instantiatePackages(instance, dependencies) {
    for (const packageConfig of dependencies) {
        let pkg = require(packageConfig.name);

        if (packageConfig.mock) {
            instance[packageConfig.name] = packageConfig.mock;
            continue;
        }

        if (packageConfig.callFunction) {
            instance[convertFileNameToFieldName(packageConfig.instanceName || packageConfig.name)] = pkg[packageConfig.callFunction.name].call(...packageConfig.callFunction.arguments);
        }
    }
}

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