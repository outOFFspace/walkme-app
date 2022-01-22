const {fetchMultipleEndpoints} = require('../services/multiple');

module.exports = {
    async getMultipleEndpoints(req, res) {
        const {query} = req;
        try {
            res.send(await fetchMultipleEndpoints(query));
        } catch (e) {
            res.status(400).send({status: 400, response: e.message});
        }
        res.end();
    }
}
