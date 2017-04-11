class TestService {
    async getSomeFromCache() {
       return this.redis.get('blahblah');
    }
}

module.exports = () => new TestService();