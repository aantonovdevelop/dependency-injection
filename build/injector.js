"use strict";

const Formatter = require('./formatter');

class Injector {
    static constructorRestInjection(constructor, components) {
        return new constructor(...Formatter.toArray(components));
    }

    static constructorObjectInjection(constructor, components) {
        return new constructor(Formatter.toObject(components));
    }

    static constructorBodyInjection(constructor, components) {
        return Object.assign(new constructor(), Formatter.toObject(components));
    }

    static mockBodyInjection(mock, components) {
        return Object.assign(mock, Formatter.toObject(components));
    }

    static functionBodyInjection(constructor, components) {
        return Object.assign(constructor(), Formatter.toObject(components));
    }

    static functionClojureRestInjection(constructor, components) {
        return constructor(...Formatter.toArray(components));
    }

    static functionClojureObjectInjection(constructor, components) {
        return constructor(Formatter.toObject(components));
    }

    static inject(constructor, components, type) {
        switch (type) {
            case 'constructor-rest':
                {
                    return Injector.constructorRestInjection(constructor, components);
                }

            case 'constructor-object':
                {
                    return Injector.constructorObjectInjection(constructor, components);
                }

            case 'constructor-body':
                {
                    return Injector.constructorBodyInjection(constructor, components);
                }

            case 'function-body':
                {
                    return Injector.functionBodyInjection(constructor, components);
                }

            case 'function-rest':
                {
                    return Injector.functionClojureRestInjection(constructor, components);
                }

            case 'function-object':
                {
                    return Injector.functionClojureObjectInjection(constructor, components);
                }

            default:
                {
                    throw new Error('Unknown type of construct or injection');
                }
        }
    }
}

module.exports = Injector;