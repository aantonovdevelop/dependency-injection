// @flow

"use strict";

const Dependency = require('../src/components/dependency');
const Package = require('../src/components/package');

export type TBlueprint = {
    name: string,
    type: string,
    deployType: string,
    injectType: string,

    dependencies: Array<Dependency>,
    packages: Array<Package>,

    constructor: Function,

    mock: ?Object
}

export type TDependency = {
    name: string,
    type: string,
    mock: ?Object
}

export type TMiddleware = {
    name: string,
    component: {
        type: string,
        name: string,
        func: ?string
    },
    except: ?Array<Object>,
    only: ?Array<Object>
}

export type TRoute = {
    url: string,
    method: string,
    func: {
        fromType: string,
        compName: string,
        funcName: string
    }
}

export type TComponentInstance = {
    name: string,
    instance: Object
}

export type TPackage = {
    name: string,
    instanceName: ?string,
    path: ?string,
    isNative: ?boolean,
    callFunction: ?{
        name: string,
        args: Array<Object>
    },
    mock: ?any
}

export type TRawBlueprint = {
    name: string,
    type: string,
    typePath: string,
    deployType: string,
    injectType: string,
    constructor: ?Function,
    mock: ?Object,
    dependencies: Array<Object>,
    packages: Array<Object>
}
