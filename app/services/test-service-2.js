class TestService2 {
    async isTestService2() {
        return "yes";
    }
}

module.exports = () => new TestService2();
