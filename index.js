var cli = require('cli').enable('help', 'status', 'version')
    , github = require('./lib/github')
    , optionsValidator = require('./lib/options_validator')
    , prompt = require('prompt').start();

var merge = require('merge'), original, cloned;

cli.setApp('./package.json');

cli.parse({
    perpage:  ['p', 'number of repos per page', 'number', 100],
    type: ['t', 'can be one of: all, public, private, forks, sources, member', 'string', 'all'],
    exclude: ['e', 'Exclude passed repos, comma separated', 'string'],
    only: ['o', 'Only clone passed repos, comma separated', 'string'],
    regexp: ['r', 'If true, exclude or only option will be evaluated as a regexp', 'boolean', false],
    username: ['u', 'Username for basic authentication. Required to access github api', 'string'],
    token: ['token', 'Token authentication. Required to access github api', 'string']
});

getRepositories = function(args, options) {
    var gitOptions = merge(options, { organization: args[0] });
    var organization = new github.Organization(gitOptions);

    var validatorResult = optionsValidator.execute(gitOptions);

    if (validatorResult.valid) {
        var callback = function(err, success) {
            if (err) {
                cli.info('error executing request ', err);
            } else {
                if (this.currentPage <= this.getLastPage()) {
                    this.getRepositories(callback);
                }
            }
        }

        organization.getRepositories(callback);
    } else {
        cli.error(validatorResult.message);
    }
};

cli.main(function(args, options) {
    var token = process.env.GITHUB_TOKEN || options.token;

    if (token) {
        if (!options.token) {
            options = merge(options, { token: token });
        }

        getRepositories(args, options);
    } else {
        prompt.get([{
            name: 'password',
            hidden: true,
            required: true
        }], function(err, result) {
            getRepositories(args, merge(options, result));
        });
    }
})