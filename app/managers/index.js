module.exports = [{
    name: "test-manager",
    packages: [],
    services: [{
        name: 'test-service',
        arguments: []
    }],
    managers: [],
    others: []
}, {
    name: 'test-manager-new',
    deployType: 'new',
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
}];
