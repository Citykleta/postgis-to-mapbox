const nock = require('nock');
const {test} = require('zora');
// const {stage} = require('../../src/lib/mapbox.js');

test('get AWS credentials: respond with credentials', async t => {
    const conf = {
        username: 'lorenzofox',
        token: 'sk.eyJ1IjoibG9yZW56b2ZveCIsImEiOiJjanJqbjhobXYwN2JuNDNwMndrZG1vd2p5In0.eRKrKll_in8mgRrwVi_fVA'
    };
    const instance = service(conf);
    const response = {
        accessKeyId: 'an_access_key_id',
        bucket: 'a_bucket',
        key: 'a_key',
        secretAccessKey: 'a_secret_access_key',
        sessionToken: 'a_session_token',
        url: 'an_url'
    };
    const mb = nock('https://api.mapbox.com')
        .post('/uploads/v1/lorenzofox/credentials')
        .query({access_token: conf.token})
        .reply(200, response);

    const res = await instance.getAWSCredentials();

    t.ok(mb.isDone(), 'server call should have been performed');
    t.eq(res, response, 'response body should match');
});
