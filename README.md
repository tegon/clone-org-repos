# Clone github repositories


[![NPM](https://nodei.co/npm/clone-org-repos.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/clone-org-repos/)
[![Build Status](https://travis-ci.org/tegon/clone-org-repos.svg?branch=master)](https://travis-ci.org/tegon/clone-org-repos)
[![Coverage Status](https://coveralls.io/repos/tegon/clone-org-repos/badge.svg?branch=master&service=github)](https://coveralls.io/github/tegon/clone-org-repos?branch=master)

This is a tool to clone all repositories from an github organization.
This could be helpful if you work at some company, or if you contribute to an open source project.

## Why?

I went through this a few times, I need to clone all repositories from the company where I work, and, in the beginning, this line of Ruby code was sufficient:

```ruby
curl -s "https://api.github.com/orgs/ORG_NAME/repos?per_page=100" -u "username" | ruby -rubygems -e 'require "json"; JSON.load(STDIN.read).each {|repo| %x[git clone #{repo["ssh_url"]} ]}'
```

But things got a little complicated. Some repositories aren't used by me because they are from different teams. In this case this tool can be useful because it allows you to pass options to ignore some repositories.

## Usage

```shell
npx clone-org-repos [OPTIONS] [ORG]
```
or install globally

```shell
npm install -g clone-org-repos
cloneorg [OPTIONS] [ORG]
```

### Options:

| Short option | long option | Description | Data type | Choices | Default |
| ---   | --- | --- | --- | --- | --- | 
| -t| --token |GitHub access Token.  [REQUIRED] | string  |
| -c| --cloneSettings |Space delimited list of additional options to pass to git clone command. |array || []
| -d| --debug |Enable debug mode. -dd to enable verbose mode. | count || 0
| -e| --exclude |Space delimited list of repository names to exclude. |array || []
| -f| --fetch |Fetch (not pull) existing repositories. -ff to skip cloning and fetch only. | count || []
| -g| --group |GitHub organizations or users. | string | orgs, users |orgs
| -i| --onlyRegExp | Regular expression that matches the repository names to clone. | string | | /.*/
| -j| --json | Path to JSON config file
| -n| --perPage |Number of repos per page |number |  |100
| -o| --only | Space delimited list of the repository names to clone. |array|  | []
| -p| --protocol | GitHub access protocol. |string |  git, ssh, https | ssh
| -r| --type | Type of repositories to include. |string |all, public, private, forks, sources, member | all
| -s| --fetchSettings |Space delimited list of additional options to pass to git fetch command. | array || --all
| -x| --excludeRegExp |Regular expression that matches the repository names to exclude. | string || /\$^/
| -h| --help | Show help 
| -v| --version |Show version number

**Nota Bene:** you can specify `--only`, `--onlyRegEx`, `--exclude`, and `--excludeRexEx` all (or some) on the same command 
and they will be logically `anded` together. However, it is unlikely that you need more than one of them. 

## Examples:

clones all repositories. An GitHub access token (`--token` or `-t`) is always required. 

```shell
npx clone-org-repos angular --token GITHUB_TOKEN

INFO: Requesting github repositories for angular with url https://api.github.com/orgs/angular/repos?per_page=100&type=all
INFO: Requesting github repositories for angular with url https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2
INFO: 1 of 192 - .github
INFO: 2 of 192 - a
INFO: 3 of 192 - angular
INFO: 4 of 192 - angular-bazel-example
INFO: 5 of 192 - angular-carousel
INFO: 6 of 192 - angular-cli
...


```

or 

```shell 
npx clone-org-repos facebook --token GITHUB_TOKEN 

```

**Nota Bene:** If the current folder contains a folder with the same name as a repository to be clones, the repository 
will be skipped. You cannot clone into an existing non-empty folder. 

### Restarting

If the process stops, or internet connectivity is dropped, just run the same command again it will automatically
skip any previously cloned repositories. 

For example, if you start to clone the `angular` organization, it might print something like the following:
```shell 
INFO: 1 of 192 - .github
...
```

If you terminate the process after 10 repositories are cloned, the new output will be something like the following:

```shell 
INFO: 1 of 182 - angular-cli
...
```

The program will automatically skip previously cloned repositories.

### Fetching existing repositories

Existing folders are automatically skipped, but this program will `fetch` the changes for those repositories if you 
set the `-f` option. (folders that are not `git` repositories are skipped)

Fetching is an "all-or-nothing operation". You either fetch all existing or none, and there is no way to restart from where 
you left off.

**Nota Bene:** The `--only`, `--onlyRegEx`, `--exclude`, and `--excludeRexEx` options are also used for fetching.

### Environment Variable

If an environment variable `GITHUB_TOKEN` is set, it will automatically be used as the GitHub access token.

```shell
export GITHUB_TOKEN='YOUR_GITHUB_API_TOKEN'
npx clone-org-repos mozilla
```

Add a `-p` or `--perpage` option to paginate response

```bash
npx clone-org-repos mozilla -t GITHUB_TOKEN -p 10
```

You can verify the environment variable is being used by running `npx clone-org-repos` and you should see the token 
as the default value for the `--token` option

### Only option

If you only need some repositories, you can pass `--only` or `-o` a space delimited list of repository names to include.

```bash
npx clone-org-repos angular -t GITHUB_TOKEN -o angular material bower-angular-i18n
```
**Nota Bena:** Just use `git clone <repository-url>` if you only need one repository cloned.

### Only Regular Expression option

This can also be an regular expression, with `--onlyRegEx` or `-i`.

```bash
npx clone-org-repos marionettejs -t GITHUB_TOKEN -i ^backbone

INFO: 1 of 9 - backbone-emulate-collection
INFO: 2 of 9 - backbone-metal
INFO: 3 of 9 - backbone.babysitter
...
```

### Exclude option
If you want to exclude only certain repositories, you can pass `--exclude` or `-e` a space delimited list of repository names to exclude.


```bash
npx clone-org-repos jquery -t GITHUB_TOKEN -e css-framework # <-- Exclude a single repositry
```

```bash
npx clone-org-repos emberjs -t GITHUB_TOKEN -e website examples # <-- Exclude a multiple repositries
```

#### Exclude Regular Expression option

```bash
npx clone-org-repos gruntjs -t GITHUB_TOKEN -x -docs$ # -x is a regular expression
```

### Git protocol option

Specify the protocol to use when cloning repositories with the `--protocol` or `-p` option.

Valid values are `ssh`, `https` or `git`. `ssh` is the default.

```bash
npx clone-org-repos gruntjs -t GITHUB_TOKEN --gitaccess=git # Clone using git protocol
```

### Clone Settings

Specify additional `git clone` options with the `--gitsettings` or `-s` option.


```bash
# Clone using git protocol and pass --recurse to `git clone` to clone submodules also
npx clone-org-repos gruntjs -t GITHUB_TOKEN --gitsettings "--recurse"
```
