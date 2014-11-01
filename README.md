Clone github organization repos
===

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
  -p, --perpage NUMBER number of repos per page (Default is 100)
  -t, --type STRING    can be one of: all, public, private, forks, sources,
                         member  (Default is all)
  -e, --exclude STRING   Exclude passed repos, comma separated
  -o, --only STRING      Only clone passed repos, comma separated
  -r, --regexp BOOLEAN   If true, exclude or only option will be evaluated as a
                         regexp
  -u, --username STRING  Username for basic authentication. Required to
                         access github api
      --token STRING     Token authentication. Required to access github api
      --debug            Show debug information
  -v, --version          Display the current version
  -h, --help             Display help and usage details
```

Examples:
---

clones all github/twitter repositories, with HTTP basic authentication. A password will be required

```bash
cloneorg twitter -u GITHUB_USERNAME
```

clones all github/twitter repositories, with an access token provided by Github

```bash
cloneorg twitter -t GITHUB_TOKEN
```

Add a -p or --perpage option to paginate response

```bash
cloneorg mozilla -t GITHUB_TOKEN -p 10
```

Exclude and Only options
---

If you only need some repositories, you can pass -o or --only with their names

```bash
cloneorg angular -t GITHUB_TOKEN -o angular
```

This can be an array to

```bash
cloneorg angular -t GITHUB_TOKEN -o angular,material,bower-angular-i18n
```

This can also be an regular expression, with -r or --regexp option set to true.

```bash
cloneorg marionettejs -t GITHUB_TOKEN -o ^backbone -r true
```

The same rules apply to exclude options

```bash
cloneorg jquery -t GITHUB_TOKEN -e css-framework # simple
```

```bash
cloneorg emberjs -t GITHUB_TOKEN -e website,examples # array
```

```bash
cloneorg gruntjs -t GITHUB_TOKEN -e $-docs -r true # regexp
```