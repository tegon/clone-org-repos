Clone github organization repos
===

This is a tool to help developers to clone all github repos from an organization.
This could be helpfull if you work at some company, or contribute to an open source project that uses a github org.

Why?
---
I got in this situation some times, i needed to clone all repos from company that i work for,
and in the beginning, just one line of ruby code was enough:

```ruby
curl -s "https://api.github.com/orgs/ORG_NAME/repos?per_page=100" -u "username" | ruby -rubygems -e 'require "json"; JSON.load(STDIN.read).each {|repo| %x[git clone #{repo["ssh_url"]} ]}'
```

But things got a little complicated. Some repositories arent used by me, they are for different teams, so, i doesn't needed then, here it comes the use for this cli.

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
This will clone all repositores that have backbone.* in the name

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