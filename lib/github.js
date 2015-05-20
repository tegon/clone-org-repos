var spawn = require('child_process').spawn
    , cli = require('cli').enable('help', 'status', 'version')
    , request = require('request').defaults({ jar: true });

var github = exports;

function Organization(options) {
    this.BASE_URI = 'https://api.github.com/orgs/';
    this.currentPage = 1;
    this.organization = options.organization;
    this.perpage = options.perpage;
    this.username = options.username;
    this.password = options.password;
    this.token = options.token;
    this.regexp = options.regexp;

    if (options.only && options.regexp) {
        this.only = new RegExp(options.only);
    } else if (options.only) {
        this.only = options.only.split(',');
    }

    if (options.exclude && options.regexp) {
        this.exclude = new RegExp(options.exclude);
    } else if (options.exclude) {
        this.exclude = options.exclude.split(',');
    }

    this.type = options.type;
    this.nextPageUrl = this.getRequestUri();
}

Organization.prototype.getRequestUri = function() {
    return this.BASE_URI + this.organization + '/repos' + '?per_page=' + this.perpage + '&type=' + this.type;
}

Organization.prototype.getLastPage = function() {
    return this.lastPage || 1;
}

Organization.prototype.getRepositories = function(callback) {
    var options = {
        url: this.nextPageUrl,
        headers: {
            'User-Agent': 'request'
        },
        json: true
    };

    if (this.token) {
        options.headers['Authorization'] = 'token ' + this.token;
    } else {
        options['auth'] = {
          'user': this.username,
          'pass': this.password,
          'sendImmediately': true
        };
    }

    cli.info('Requesting github repositories for ' + this.organization + ' with url ' + options.url + ' ...');

    request.get(options, function (error, response, body) {

        if (error) {
            cli.error(error);
            callback.call(this, error);
        } else {
            cli.debug('current page ' + this.currentPage);
            this.parseLinks(response);
            this.currentPage++;
            cli.debug('next page ' + this.nextPageUrl);
            cli.debug('last page ' + this.getLastPage());

            for (var i = 0; i < body.length; i++) {
                this.clone(body[i]);
            }

            callback.call(this, null, { sucess: true });
        }
    }.bind(this));
}

Organization.prototype.parseLinks = function(response) {
    if (response.headers.link) {
        var paginationLinks = {};
        var links = response.headers.link.split(',')

        for (var i = 0; i < links.length; i++) {
            var section = links[i].split(';');
            var url = section[0].replace(/<(.*)>/, '$1').trim();
            var name = section[1].replace(/rel="(.*)"/, '$1').trim();

            if (name == 'last') {
                this.lastPage = section[0].match(/&page=(.*)/)[1].replace('>', ' ');
            }
            paginationLinks[name] = url;
        }
        this.nextPageUrl = paginationLinks['next'];
        cli.debug('nextPageUrl ' + this.nextPageUrl);
    }
}

Organization.prototype.clone = function(repo) {
    if (this.exclude && this.regexp && repo.name.match(this.exclude)) {
        return cli.debug('Repository ' + repo.name + ' ignored, exclude option: ' + this.exclude);
    } else if (this.exclude && !this.regexp && this.exclude.indexOf(repo.name) != -1) {
        return cli.debug('Repository ' + repo.name + ' ignored, exclude option: ' + this.exclude);
    } else if (this.only && this.regexp && !repo.name.match(this.only)) {
        cli.debug('Repository ' + repo.name + ' ignored, only option: ' + this.only);
    } else if (this.only && !this.regexp && this.only.indexOf(repo.name) == -1) {
        return cli.debug('Repository ' + repo.name + ' ignored, only option: ' + this.only);
    } else {
        this.executeCloneCommand(repo);
    }
}

Organization.prototype.executeCloneCommand = function(repo) {
    cli.debug('cloning ' + repo.ssh_url);

    var process = spawn('git', ['clone', repo.ssh_url]);

    process.on('close', function(status) {
        if (status == 0) {
            cli.debug('success cloning ' + repo.ssh_url);
        } else {
            cli.error('git clone failed with status ' + status);
        }
    });
}

module.exports = github;
github.Organization = Organization;