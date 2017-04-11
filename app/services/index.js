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
    services: [],
    managers: [],
    others: []
}];