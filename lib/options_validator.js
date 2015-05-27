var optionsValidator = exports;

optionsValidator.execute = function(options) {
    result = {};
    perPageResult = {};
    typeResult = {};

    if (options.perpage) {
        perPageResult = this.validatePerPage(options.perpage);
    }

    if (options.type) {
        typeResult = this.validateType(options.type);
    }

    excludeOnlyResult = this.validateExcludeAndOnly(options.exclude, options.only);

    passwordResult = this.validatePassword(options);

    result.valid = !!(perPageResult.valid && typeResult.valid && excludeOnlyResult.valid && passwordResult.valid);
    result.message = [perPageResult.message, typeResult.message, excludeOnlyResult.message, passwordResult.message].join(' ');

    return result;
}

optionsValidator.validatePassword = function(options) {
    result = {};
    result.valid = !!(options.token || options.password);

    if (!result.valid) {
        result.message = 'Please provide an password';
    }

    return result;
}

optionsValidator.validateExcludeAndOnly = function(exclude, only) {
    result = {};
    result.valid = !!(exclude == null || only == null);

    if (!result.valid) {
        result.message = 'Exclude and only options passed. Please pass just one of them.';
    }

    return result;
}

optionsValidator.validatePerPage = function(perpage) {
    result = {};
    result.valid = !isNaN(perpage);

    if (!result.valid) {
        result.message = perpage + ' is not a number';
    }

    return result;
}

optionsValidator.validateType = function(type) {
    validTypes = ['all', 'public', 'private', 'forks', 'sources', 'member'];
    result = {};
    result.valid = validTypes.indexOf(type) != -1;

    if (!result.valid) {
        result.message = type + ' is not a valid type. Should be any of: ' + validTypes.join(', ');
    }

    return result;
}

module.exports = optionsValidator;