const customersData = require('../data/customers');

module.exports = {
    findCustomerById(id) {
        if (isNaN(id)) {
            return null;
        }
        return customersData.find((c) => c.id === id);
    }
}
