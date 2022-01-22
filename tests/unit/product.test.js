const {findProductById} = require('../../services/product');

describe('Fetch products', () => {
    test('product with id 992 found', () => {
        const customer = findProductById(992);
        ['name', 'id', 'price'].forEach((field) => {
            expect(customer).toHaveProperty(field);
        });
    });

    test('product with id 99999 does not exists', () => {
        expect(findProductById(99999)).toBeFalsy();
    });

    test('product with non numeric id does not exists', () => {
        expect(findProductById('aaaa')).toBeFalsy();
    });
});

