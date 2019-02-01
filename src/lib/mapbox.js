const mapbox = require('@mapbox/mapbox-sdk/services/uploads');

exports.service = (conf) => {
    const client = mapbox({accessToken: conf.token});
    return {
        async createCafeTileSet(opts = {}) {
            const {tilesetName} = opts;
            const {mapId = `${conf.username}.${tilesetName}`, url} = opts;
            const resp = await client
                .createUpload({
                    mapId, url, tilesetName
                })
                .send();
            return resp.body;
        },

        async getAWSCredentials() {
            const resp = await client
                .createUploadCredentials()
                .send();
            return resp.body;
        }
    };
};
