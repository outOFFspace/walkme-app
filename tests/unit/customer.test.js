const {findCustomerById} = require('../../services/customer');

describe('Fetch customers', () => {
    test('customer with id 13 found', () => {
        const customer = findCustomerById(13);
        ['name', 'id', 'age'].forEach((field) => {
            expect(customer).toHaveProperty(field);
        });
    });

    test('customer with id 99999 does not exists', () => {
        expect(findCustomerById(99999)).toBeFalsy();
    });

    test('customer with non numeric id does not exists', () => {
        expect(findCustomerById('dddd')).toBeFalsy();
    });
});
