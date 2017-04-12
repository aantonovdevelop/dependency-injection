module.exports = [{
    name: "test-service",
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
}, {
    name: 'test-service-2',
    packages: [],
    services: [],
    managers: [],
    others: []
}];