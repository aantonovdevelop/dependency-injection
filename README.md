## Installation

```bash
npm install @aantonov/dep-injector
```
## Usage
```javascript
const app = require('express')();

const Factory = require('dep-injector');

const factory = new Factory(app);

const options = {
    //Определяем путь к установленным npm пакетам
    packagesPath: `${__dirname}/node_modules/`,

    //Указываем типы классов которые будут использоваться в приложении
    types: {
        managers: {
            //Указываем путь к конфигу инстанцирования классов. Конфиг инстанцирования подтягивается из app/managers/index.js
            path: `${__dirname}/app/managers`
        },

        services: {
            path: `${__dirname}/app/services`
        },

        controllers: {
            path: `${__dirname}/app/controllers`,

            //Если определена переменная config, то конфиги инстанцирования подтягиваютс из неё, а app/controllers/index.js игнорируется
            blueprints: [{
                //Имя модуля. Будет инстанцирован как testController
                name: 'test-controller',

                //См. ниже
                deployType: 'constructor',
                injectType: 'body',
                
                packages: [{
                    name: 'assert',

                    //Указываем, если модуль нативный
                    native: true
                }, {
                    name: 'then-redis',

                    //Указываем, если необходимо изменить имя инстанса. Иначе инстанцируется как thenRedis
                    instanceName: 'redis',

                    //Указываем, если после экспорта модуля необходимо вызвать функцию какую то из его функций
                    callFunction: {
                        name: 'createClient',
                        arguments: []
                    }
                }],

                //Определяем зависимости
                dependencies: {

                    services: [{
                        name: 'test-service',

                        //Если у зависимости определено поле `mock`, то этот объект будет заменять реальную зависимость
                        mock: {
                            getSomeNumber: function () {return 10}
                        }
                    }]
                }

            }]
        }
    },

    //Привязываем роуты к функциям контроллера
    routes: [{
        //Тип запроса
        method: 'post',

        //URL запроса
        url: '/some',

        //Метод контроллера который будет привязан к роуту
        func: 'controllers.test-controller.someFunction'
    }]
}

//Инстанцируем классы и зависимости
factory.create(options)

```
### Controller example

Если `deployType: 'constructor' && injectType: 'object'`

```javascript
class TestController {
    constructor(options) {
        this._assert = options.assert;
        this._testService = options.testService;
    }

    someFunction(req, res) {
        this._assert.equal(this._testService.getSomeValue(), 10); //ok

        res.send(200);
    }
}
```

Если `deployType: 'constructor' && injectType: 'body'`

```ecmascript 6
class TestController {
    _assert: TAssert;
    _testService: TestService;
    
    someFunction(req, res) {
        this._assert.equal(this._testService.getSomeValue(), 10); //ok

        res.send(200);
    }
}
```

### Mocks

```ecmascript 6
const Factory = require('./build/factory');
const factory = new Factory();

const config = {
    types: {
        controller: {
            blueprints: [{
                name: 'test-controller',
                // deployType & injectType игнорируются. Зависимости ижектятся в тело мока
                mock: {
                    sign: async function (req, res) {
                        const response = await this.testService.get();

                        res.send(response);
                    }
                },

                dependencies: [{
                    name: 'test-service',
                    type: 'service'
                }]
            }]
        },

        service: {
            blueprints: [{
                name: 'test-service',
                deployType: 'constructor',
                injectType: 'object',

                //Инстанцирует класс исходя из конструктора
                $constructor: class {
                    constructor({redis}) {
                        this.redis = redis;
                    }

                    async get() {
                        return this.redis.get('key');
                    }
                },

                packages: [{
                    name: 'redis',
                    mock: {
                        get: function () {
                            return Promise.resolve('Hello World!')
                        }
                    }
                }]
            }]
        }
    }
};

const instances = factory.create(config);

const res = {send: function (value) {
    console.log(value); // Print 'Hello World!'
}};

/**
* {string} Name name of component
* {string} Type type of component
*/
instances.get('test-controller', 'controller').sign({}, res);
```