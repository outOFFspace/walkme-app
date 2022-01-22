const productsData = require('../data/products');

module.exports = {
    findProductById(id) {
        if (isNaN(id)) {
            return null;
        }
        return productsData.find((p) => p.id === id);
    }
}
