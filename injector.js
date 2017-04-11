module.exports = function (config) {
    let servicesConfig = config && config.services || require('./app/services'),
        managersConfig = config && config.managers || require('./app/managers');

    let instantiatedServices = instantiateServices(servicesConfig);
    let instantiatedManagers = instantiateManagers(instantiatedServices, managersConfig);

    return {
        instantiatedServices,
        instantiatedManagers
    }
};

function instantiateServices(blueprints) {
    let instantiatedServices = {};

    for (const blueprint of blueprints) {
        let service = require('./app/services/' + blueprint.name)();

        instantiatePackages(service, blueprint.packages);

        instantiatedServices[convertFileNameToFieldName(blueprint.name)] = service;
    }

    return instantiatedServices;
}

function instantiateManagers(services, blueprints) {
    let instantiatedManagers = {};

    for (const blueprint of blueprints) {
        let manager = require('./app/managers/' + blueprint.name)();

        bindServices(manager, blueprint.services, services);

        instantiatedManagers[convertFileNameToFieldName(blueprint.name)] = manager;
    }

    return instantiatedManagers;
}

function instantiatePackages(instance, dependencies) {
    for (const packageConfig of dependencies) {
        let pkg = require(packageConfig.name);

        if (packageConfig.callFunction) {
            instance[convertFileNameToFieldName(packageConfig.instanceName || packageConfig.name)] = pkg[packageConfig.callFunction.name].call(...packageConfig.callFunction.arguments);
        } else if (packageConfig.mock) {
            instance[packageConfig.name] = packageConfig.mock;
        }
    }
}

function bindServices(instance, dependencies, services) {
    for (const serviceConfig of dependencies) {
        if (serviceConfig.mock) {
            instance[convertFileNameToFieldName(serviceConfig.name)] = serviceConfig.mock;
        } else {
            instance[convertFileNameToFieldName(serviceConfig.name)] = services[convertFileNameToFieldName(serviceConfig.name)];
        }
    }
}

function convertFileNameToFieldName(name) {
    name = name.split('-');

    if (name[1]) {
        name[1] = name[1][0].toUpperCase() + name[1].slice(1, name[1].length);

        return name[0] + name[1];
    }

    return name[0];
}