Clone github organization repos
===

[![NPM](https://nodei.co/npm/clone-org-repos.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/clone-org-repos/)
[![Build Status](https://travis-ci.org/tegon/clone-org-repos.svg?branch=master)](https://travis-ci.org/tegon/clone-org-repos)
[![Coverage Status](https://coveralls.io/repos/tegon/clone-org-repos/badge.svg?branch=master&service=github)](https://coveralls.io/github/tegon/clone-org-repos?branch=master)

This is a tool to clone all repositories from an github organization.
This could be helpful if you work at some company, or if you contribute to an open source project.

Why?
---
I went through this a few times, I need to clone all repositories from the company where I work, and, in the beginning, this line of Ruby code was sufficient:

```ruby
curl -s "https://api.github.com/orgs/ORG_NAME/repos?per_page=100" -u "username" | ruby -rubygems -e 'require "json"; JSON.load(STDIN.read).each {|repo| %x[git clone #{repo["ssh_url"]} ]}'
```

But things got a little complicated. Some repositories aren't used by me because they are from different times. In this case this tool can be useful because it allows you to pass options to ignore some repositories.

Usage
---
```bash
  cloneorg [OPTIONS] [ORG]
```

Options:
---
```bash
  -p,  --perpage NUMBER number of repos per page (Default is 100)
  -t,  --type STRING    can be one of: all, public, private, forks, sources,
                         member  (Default is all)
  -e,  --exclude STRING   Exclude passed repos, comma separated
  -o,  --only STRING      Only clone passed repos, comma separated
  -r,  --regexp BOOLEAN   If true, exclude or only option will be evaluated as a
                         regexp
  -u,  --username STRING  Username for basic authentication. Required to
                         access github api
       --token STRING     Token authentication. Required to access github api
  -a, --gitaccess         Protocol to use in `git clone` command. Can be `ssh` (default), `https` or `git`
  -s, --gitsettings       Additional parameters to pass to git clone command. Defaults to empty.
       --debug            Show debug information
  -v,  --version          Display the current version
  -h,  --help             Display help and usage details
```

Examples:
---

clones all github/twitter repositories, with HTTP basic authentication. A password will be required

```bash
cloneorg twitter -u GITHUB_USERNAME
cloneorg twitter --username=GITHUB_USERNAME
```

clones all github/twitter repositories, with an access token provided by Github

```bash
cloneorg twitter --token GITHUB_TOKEN
```

If an environment variable `GITHUB_TOKEN` is set, it will be used.

```bash
export GITHUB_TOKEN='YOUR_GITHUB_API_TOKEN'
```

Add a -p or --perpage option to paginate response

```bash
cloneorg mozilla --token=GITHUB_TOKEN -p 10
```

Exclude and Only options
---

If you only need some repositories, you can pass -o or --only with their names

```bash
cloneorg angular --token=GITHUB_TOKEN -o angular
```

This can be an array to

```bash
cloneorg angular --token=GITHUB_TOKEN -o angular,material,bower-angular-i18n
```

This can also be an regular expression, with -r or --regexp option set to true.

```bash
cloneorg marionettejs --token=GITHUB_TOKEN -o ^backbone -r true
```

The same rules apply to exclude options

```bash
cloneorg jquery --token=GITHUB_TOKEN -e css-framework # simple
```

```bash
cloneorg emberjs --token=GITHUB_TOKEN -e website,examples # array
```

```bash
cloneorg gruntjs --token=GITHUB_TOKEN -e $-docs -r true # regexp
```

```bash
cloneorg gruntjs --token=GITHUB_TOKEN -e $-docs -r true --gitaccess=git # Clone using git protocol
```

```bash
# Clone using git protocol and pass --recurse to `git clone` to clone submodules also
cloneorg gruntjs --token=GITHUB_TOKEN -e $-docs -r true --gitaccess=git --gitsettings="--recurse"
```

ToDo
---

- Progress bar while cloning repos
