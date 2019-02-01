exports.cafes = async (client) => {
    const {rows} = await client.query(`
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
;`);

    return {
        type: 'FeatureCollection',
        features: rows.map(row => {
            return {
                type: 'Feature',
                geometry: JSON.parse(row.Feature),
                properties: {
                    name: row.name,
                    osm_id: row.osm_id,
                    amenity: row.amenity
                }
            };
        })
    };
};

exports.bicycles = async (client) => {
    const {rows} = await client.query(`
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
;`);

    return {
        type: 'FeatureCollection',
        features: rows.map(row => {
            return {
                type: 'Feature',
                geometry: JSON.parse(row.Feature),
                properties: {
                    name: row.name,
                    osm_id: row.osm_id,
                    amenity: row.amenity,
                    operator: row.operator
                }
            };
        })
    };
};
