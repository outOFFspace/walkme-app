module.exports = class WrongEndpointsException extends Error {
    constructor() {
        super('Wrong endpoints object');
    }
}
