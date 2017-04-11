let injector = require('./injector')();

let testService = injector.instantiatedServices.testService;
let testManager = injector.instantiatedManagers.testManager;

async function a() {
    let bla = await testService.getSomeFromCache();
    let blo = await testManager.upperCaseRecord();

    console.log(bla);
}

a();
