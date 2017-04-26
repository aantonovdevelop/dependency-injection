## Installation

```bash
npm install @aantonov/dep-injector
```
## Usage
```javascript
const injector = require('dep-injector');
const app = require('express')();

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
            config: [{
                //Имя модуля. Будет инстанцирован как testController
                name: 'test-controller',

                //См. ниже
                deployType: 'new',

                //Определяем зависимости
                dependencies: {
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

                    services: [{
                        name: 'test-service',

                        //Если у зависимости определено поле `mock`, то этот объект будет заменять реальную зависимость
                        mock: {
                            getSomeNumber: function () {return 10}
                        }
                    }]
                },

                //Привязываем роуты к функциям контроллера
                routes: [{
                    //Имя роутера к которому будет привязан роут
                    router: 'main',

                    //Тип запроса
                    type: 'post',

                    //URL запроса
                    url: '/some',

                    //Метод контроллера который будет привязан к роуту
                    method: 'someFunction'
                }]
            }]
        }
    },

    //Определяем роутеры, которые будут исользоваться в приложении
    routers: {
        //Имена выбираем произвольно
        main: app
    }
}

//Инстанцируем классы и зависимости
injector(options)

```
### Controller example
    Если `deployType: 'new'`

```javascript
class TestController {
    constructor(options) {
        this._assert = options.assert;
        this._redis = options.redis;

        this._testService = options.testService;
    }

    someFunction(req, res) {
        this._assert.equal(this._testService.getSomeValue(), 10); //ok

        res.send(200);
    }
}

module.exports = TestController;
```

Иначе

```javascript
module.exports = function () {
    // self будет содержать все указанные в конфиге зависимости
    const self = this;

    return {
        someFunction: function (req, res) {
            self.assert.ok(self.redis); //ok
            self.assert.ok(self.testService); //ok

            self.assert.equal(self.testService.getSomeValue(), 10); //ok

            res.send(200);
        }
    }
}
```