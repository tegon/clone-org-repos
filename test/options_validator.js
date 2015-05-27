var should = require('chai').should()
    , sinon = require('sinon')
    , validator = require('../lib/options_validator');

describe('Options Validator', function() {
    it('password is required', function() {
        validator.validatePassword({ password: undefined }).valid.should.be.false;
        validator.validatePassword({ password: 'foo' }).valid.should.be.true;
    });

    it('password is not required when token is present', function() {
        validator.validatePassword({
            password: undefined,
            token: 'token'
        }).valid.should.be.true;
    });

    it('only and exclude cannot be set at same time', function() {
        validator.validateExcludeAndOnly('foo', 'bar').valid.should.be.false;
        validator.validateExcludeAndOnly('foo', null).valid.should.be.true;
        validator.validateExcludeAndOnly(null, 'bar').valid.should.be.true;
    });

    it('perpage should be a number', function() {
        validator.validatePerPage('foo').valid.should.be.false;
        validator.validatePerPage(10).valid.should.be.true;
    });

    it('type should be included on the list', function() {
        validator.validateType('foo').valid.should.be.false;

        validTypes = ['all', 'public', 'private', 'forks', 'sources', 'member'];
        validTypes.forEach(function(type) {
            validator.validateType(type).valid.should.be.true;
        });
    });
});