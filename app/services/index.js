module.exports = [{
    name: "test-service",
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
            name: 'test-service-2'
        }],
        managers: [],
        others: []
    }
}, {
    name: 'test-service-2',
    dependencies: {
        packages: [],
        services: [],
        managers: [],
        others: []
    }
}, {
    name: 'test-service-new',
    deployType: 'new',
    dependencies: {
        packages: [{
            name: 'then-redis',
            instanceName: 'redis',
            callFunction: {
                name: 'createClient',
                arguments: []
            }
        }]
    }
}];