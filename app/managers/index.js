module.exports = [{
    name: "test-manager",
    dependencies: {
        packages: [],
        services: [{
            name: 'test-service',
            arguments: []
        }],
        managers: [],
    }
}, {
    name: 'test-manager-new',
    deployType: 'new',
    dependencies: {
        packages: [{
            name: 'then-redis',
            instanceName: 'redis',
            callFunction: {
                name: 'createClient',
                arguments: []
            }
        }],
        services: [{
            name: 'test-service'
        }]
    }
}];
