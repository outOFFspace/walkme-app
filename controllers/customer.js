const {findCustomerById} = require('../services/customer');

module.exports = {
    getCustomerById(req, res) {
        const customer = findCustomerById(+req.params.id);
        if (customer) {
            res.send(customer);
        } else {
            res.status(404).send({status: 404, response: 'customer does not exist'});
        }
        res.end();
    }
}
