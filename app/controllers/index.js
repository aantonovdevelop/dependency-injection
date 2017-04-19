module.exports = [{
    name: 'test-controller',
    packages: [{
        name: 'assert',
        native: true
    }],
    services: [{
        name: 'test-service-new'
    }, {
        name: 'test-service'
    }],
    managers: [{
        name: 'test-manager-new'
    }]
}, {
    name: 'test-controller-new',
    deployType: 'new',
    packages: [{
        name: 'assert',
        native: true
    }],
    services: [{
        name: 'test-service'
    }],
    managers: [{
        name: 'test-manager-new'
    }]
}];

