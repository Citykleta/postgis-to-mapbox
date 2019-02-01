const {writeFileSync} = require('fs');
const {Pool} = require('pg');
const dbConf = require('./conf/db');
const mbxConf = require('./conf/mapbox');
const {cafes} = require('./lib/db.js');
const {service} = require('./lib/mapbox');
const {stage} = require('./lib/aws.js');
const dbClient = new Pool(dbConf);

const cafesTileSetName = 'cafes';

(async function () {

    let error = null;

    try {
        //test db
        try {
            await dbClient.query(`SELECT now()`);
        } catch (e) {
            console.log('could not connect to the db');
            console.error(e);
            process.exit(1);
        }

        const uploader = service(mbxConf);
        const cafeDataPromise = cafes(dbClient);
        const credentialsPromise = uploader.getAWSCredentials();
        const cafeData = await cafeDataPromise;
        const credentials = await credentialsPromise;
        const cafesFile = './cafes.geojson';
        writeFileSync(cafesFile, Buffer.from(JSON.stringify(cafeData)), {
            encoding: 'utf8'
        });
        const awsBucketResponse = await stage(credentials, cafesFile);
        const result = await uploader.createCafeTileSet({url: credentials.url, tilesetName: cafesTileSetName});
        console.log(JSON.stringify(result));

    } catch (e) {
        error = e;
    }
    finally {
        dbClient.end();
        if (error !== null) {
            console.error(error);
            process.exit(1);
        }
    }
})();
