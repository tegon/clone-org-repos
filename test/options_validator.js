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

    describe('Validation messages', function() {
        it('password is not valid', function() {
            validator.execute({
                password: ''
            }).message.should.include('Please provide an password');
        });

        it('exclude and only are not valid', function() {
            validator.execute({
                exclude: 'foo',
                only: 'bar'
            }).message.should.include('Exclude and only options passed. Please pass just one of them.');
        });

        it('perpage is not valid', function() {
            validator.execute({
                perpage: 'foo',
                password: 'bar'
            }).message.should.include('foo is not a number');
        });

        it('type is not valid', function() {
            validator.execute({
                type: 'bar'
            }).message.should.include('bar is not a valid type');
        });
    });
});