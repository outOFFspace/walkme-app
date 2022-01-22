const {findProductById} = require('../services/product');

module.exports = {
    getProductById(req, res) {
        const product = findProductById(+req.params.id);
        if (product) {
            res.send(product);
        } else {
            res.status(404);
            res.send({status: 404, response: 'product does not exist'});
        }
        res.end();
    }
}
