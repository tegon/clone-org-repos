var should = require('chai').should()
    , sinon = require('sinon')
    , github = require('../lib/github');

describe('Organization', function() {
    before(function() {
        organization = new github.Organization({
            organization: 'foo',
            perpage: 10,
            type: 'bar',
            regexp: true,
            only: 'foo-*',
            exclude: '^bar',
            gitaccess: 'https',
            gitsettings: '--recurse'
        });
    });

    it('returns the full github api url', function() {
        organization.getRequestUri().should.equal('https://api.github.com/orgs/foo/repos?per_page=10&type=bar');
    });

    it('creates a regular expression for only option', function() {
       organization.only.should.be.a('RegExp');
    });

    it('creates a regular expression for exclude option', function() {
       organization.exclude.should.be.a('RegExp');
    });

    it('returns 1 if lastPage is undefined', function() {
       organization.getLastPage().should.equal(1);
       organization.lastPage = 2
       organization.getLastPage().should.equal(2);
    });

    it('nextPageUrl should equals to getRequestUri', function() {
       organization.nextPageUrl.should.equal(organization.getRequestUri());
    });

    it('parses link to next page url', function() {
        organization.parseLinks({
            headers: {
                link: '<https://api.github.com/resource?per_page=10&page=2>; rel="next",<https://api.github.com/resource?per_page=10&page=5>; rel="last"'
            }
        });
        organization.nextPageUrl.should.equal('https://api.github.com/resource?per_page=10&page=2');
        organization.lastPage.should.equal(5);
    });

    describe('getCloneUrl function', function() {
        before(function() {
            repo = {
                'ssh_url': 'git@github.com:tegon/clone-org-repos.git',
                'clone_url': 'https://github.com/tegon/clone-org-repos.git',
                'git_url': 'git:github.com/tegon/clone-org-repos.git'
            };
        });

        describe('when protocol is ssh', function() {
            before(function() {
                organization = new github.Organization({
                    gitaccess: 'ssh'
                });
            });

            it('returns the ssh url', function() {
                organization.getCloneUrl(repo).should.equals('git@github.com:tegon/clone-org-repos.git');
            });
        });

        describe('when protocol is https', function() {
            before(function() {
                organization = new github.Organization({
                    gitaccess: 'https'
                });
            });

            it('returns the https url', function() {
                organization.getCloneUrl(repo).should.equals('https://github.com/tegon/clone-org-repos.git');
            });
        });

        describe('when protocol is https', function() {
            before(function() {
                organization = new github.Organization({
                    gitaccess: 'git'
                });
            });

            it('returns the git url', function() {
                organization.getCloneUrl(repo).should.equals('git:github.com/tegon/clone-org-repos.git');
            });
        });

        describe('when protocol is not valid', function() {
            before(function() {
                organization = new github.Organization({
                    gitaccess: 'foo'
                });
            });

            it('returns the undefined', function() {
                should.equal(organization.getCloneUrl(repo), undefined);
            });
        });
    });

    describe('Clone function', function() {
        afterEach(function() {
            cloneSpy.reset();
        });

        describe('exclude option', function() {
            describe('regular expression mode', function() {
                before(function() {
                    organization = new github.Organization({
                        regexp: true,
                        exclude: 'foo-*'
                    });

                    cloneSpy = sinon.stub(organization, 'executeCloneCommand').returns(undefined);
                });

                it('does not execute clone command', function() {
                    var repo = { name: 'foo-barzin' };
                    organization.clone(repo);
                    cloneSpy.callCount.should.equals(0);
                });

                it('executes clone command', function() {
                    var repo = { name: 'barzin' };
                    organization.clone(repo);
                    cloneSpy.callCount.should.equals(1);
                });
            });

            describe('string mode', function() {
                before(function() {
                    organization = new github.Organization({
                        exclude: 'foozin,barzin'
                    });

                    cloneSpy = sinon.stub(organization, 'executeCloneCommand').returns(undefined);
                });

                it('does not execute clone command', function() {
                    var repo = { name: 'foozin' };
                    organization.clone(repo);

                    repo = { name: 'barzin' };
                    organization.clone(repo);

                    cloneSpy.callCount.should.equals(0);
                });

                it('executes clone command', function() {
                    var repo = { name: 'bar' };
                    organization.clone(repo);

                    repo = { name: 'barbaz' };
                    organization.clone(repo);

                    cloneSpy.callCount.should.equals(2);
                });
            });
        });

        describe('only option', function() {
            describe('regular expression mode', function() {
                before(function() {
                    organization = new github.Organization({
                        regexp: true,
                        only: 'foo-*'
                    });

                    cloneSpy = sinon.stub(organization, 'executeCloneCommand').returns(undefined);
                });

                it('executes clone command', function() {
                    var repo = { name: 'foo-barzin' };
                    organization.clone(repo);
                    cloneSpy.callCount.should.equals(1);
                });

                it('does not execute clone command', function() {
                    var repo = { name: 'barzin' };
                    organization.clone(repo);
                    cloneSpy.callCount.should.equals(0);
                });
            });

            describe('string mode', function() {
                before(function() {
                    organization = new github.Organization({
                        only: 'foozin,barzin'
                    });

                    cloneSpy = sinon.stub(organization, 'executeCloneCommand').returns(undefined);
                });

                it('executes clone command', function() {
                    var repo = { name: 'foozin' };
                    organization.clone(repo);

                    repo = { name: 'barzin' };
                    organization.clone(repo);

                    cloneSpy.callCount.should.equals(2);
                });

                it('does not execute clone command', function() {
                    var repo = { name: 'bar' };
                    organization.clone(repo);

                    repo = { name: 'barbaz' };
                    organization.clone(repo);

                    cloneSpy.callCount.should.equals(0);
                });
            });
        });
    });
});
