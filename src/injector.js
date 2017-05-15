// @flow

"use strict";

const Formatter = require('./formatter');

class Injector {
    static constructorRestInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return new constructor(...Formatter.toArray(components));
    }

    static constructorObjectInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return new constructor(Formatter.toObject(components));
    }

    static constructorBodyInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return Object.assign(new constructor, Formatter.toObject(components));
    }

    static mockBodyInjection(mock: Object, components: Array<TComponentInstance>): Object {
        return Object.assign(mock, Formatter.toObject(components));
    }

    static functionBodyInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return Object.assign(constructor(), Formatter.toObject(components));
    }

    static functionClojureRestInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return constructor(...Formatter.toArray(components));
    }

    static functionClojureObjectInjection(constructor: Function, components: Array<TComponentInstance>): Object {
        return constructor(Formatter.toObject(components));
    }

    static inject(constructor: Function, components: Array<TComponentInstance>, type: string): Object {
        switch (type) {
            case 'constructor-rest': {
                return Injector.constructorRestInjection(constructor, components);
            }

            case 'constructor-object': {
                return Injector.constructorObjectInjection(constructor, components);
            }

            case 'constructor-body': {
                return Injector.constructorBodyInjection(constructor, components);
            }

            case 'function-body': {
                return Injector.functionBodyInjection(constructor, components);
            }

            case 'function-rest': {
                return Injector.functionClojureRestInjection(constructor, components);
            }

            case 'function-object': {
                return Injector.functionClojureObjectInjection(constructor, components);
            }

            default: {
                throw new Error('Unknown type of construct or injection');
            }
        }
    }
}

module.exports = Injector;
