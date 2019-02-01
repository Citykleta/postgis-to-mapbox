const {test} = require('zora');
const {cafes, bicycles} = require('../../src/lib/db.js');

const clientStub = () => {
    const calls = [];
    const responses = new Map();
    return {
        calls,
        async query(value) {
            calls.push(value);
            if (!responses.has(value)) {
                throw new Error(`no match for: ${value}`);
            }
            return {
                rows: responses.get(value)
            };
        },
        respond(key, value) {
            responses.set(key, value);
        }
    };
};

test('cafes: return a GEO JSON collection of cafes', async t => {
    const stub = clientStub();
    const expectedRows = [{
        Feature: '{"type":"Point","coordinates":[-82.36744,23.025493]}',
        name: 'super cafe',
        osm_id: 666,
        amenity: 'cafe'
    }, {
        Feature: '{"type":"Point","coordinates":[-82.466868,23.039185]}',
        name: 'lorenzo cafe',
        osm_id: 345,
        amenity: 'cafe'
    }];
    const expected = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: JSON.parse(expectedRows[0].Feature),
            properties: {
                name: 'super cafe',
                osm_id: 666,
                amenity: 'cafe'
            }
        }, {
            type: 'Feature',
            geometry: JSON.parse(expectedRows[1].Feature),
            properties: {
                name: 'lorenzo cafe',
                osm_id: 345,
                amenity: 'cafe'
            }
        }]
    };

    stub.respond(`
SELECT
    amenity,
    osm_id,
    name,
    ST_AsGeoJSON(ST_Transform(way, 4326), 6) as "Feature"
FROM
    planet_osm_point
WHERE
    amenity = 'cafe'
AND 
    "name" IS NOT null
AND 
    "osm_id" > 0
;`, expectedRows);

    const result = await cafes(stub);
    t.eq(result, expected);
});

test('bicycles: return a GEO JSON collection of bicycle related data', async t => {
    const stub = clientStub();
    const expectedRows = [{
        Feature: '{"type":"Point","coordinates":[-82.36744,23.025493]}',
        name: null,
        osm_id: 666,
        amenity: 'bicycle_paring',
        operator: 'parking and co'
    }, {
        Feature: '{"type":"Point","coordinates":[-82.466868,23.039185]}',
        name: 'foo rental',
        osm_id: 126,
        amenity: 'bicycle_rental',
        operator: null
    }];
    const expected = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: JSON.parse(expectedRows[0].Feature),
            properties: {
                name: null,
                osm_id: 666,
                amenity: 'bicycle_paring',
                operator: 'parking and co'
            }
        }, {
            type: 'Feature',
            geometry: JSON.parse(expectedRows[1].Feature),
            properties: {
                name: 'foo rental',
                osm_id: 126,
                amenity: 'bicycle_rental',
                operator: null
            }
        }]
    };

    stub.respond(`
SELECT
    amenity,
    operator,
    osm_id,
    name,
    ST_AsGeoJSON(ST_Transform(way, 4326), 6) as "Feature"
FROM
    planet_osm_point
WHERE
    amenity ilike '%bicycle%'
AND 
    "osm_id" > 0
;`, expectedRows);

    const result = await bicycles(stub);
    t.eq(result, expected);
});


