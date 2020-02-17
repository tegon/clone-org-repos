const eachSeries = require('async/eachSeries')
const fetch = require('node-fetch')
const path = require('path')
const { sort } = require('ramda')
const { spawn } = require('child_process')

const protocolToRepoProperty = {
  ssh: 'ssh_url',
  git: 'git_url',
  https: 'clone_url'
}

class GitHub {
  constructor (options) {
    this.options = options
    this.firstUrl = `https://api.github.com/${options.group}/${options.organization}/repos?per_page=${options.perPage}&type=${options.type}`
    this.fetchOptions = {
      method: 'get',
      headers: {
        'User-Agent': 'request',
        Authorization: 'token ' + this.options.token
      },
      json: true
    }

    this.clone = this.clone.bind(this)
    this.fetch = this.fetch.bind(this)
    this.cloneRepositories = this.cloneRepositories.bind(this)
  }

  clone (repo, callback) {
    const url = repo[protocolToRepoProperty[this.options.protocol]]
    const spawnParams = ['clone'].concat(this.options.cloneSettings, url)

    this.options.DEBUG('git', spawnParams)

    const process = spawn('git', spawnParams)

    process.on('close', (status) => {
      if (status === 0) {
        this.options.DEBUG(`${url} clone succeeded`)
      } else {
        this.options.ERROR(`${url} clone failed with status ${status}`)
      }
      callback(null, true)
    })
  }

  async cloneRepositories () {
    const fetch = await this.fetchExisting()

    if (this.options.fetch > 1) {
      return fetch
    }

    const allRepositories = await this.getRepositories(this.firstUrl)

    this.options.DEBUG('Total repository count', allRepositories.length)
    this.options.VERBOSE('All Repositories', allRepositories)

    const filteredRepositories = this.options.repositoryFilter(allRepositories)
    const repositoryCount = filteredRepositories.length
    let current = 0

    this.options.DEBUG('Filtered repository count', filteredRepositories.length)
    this.options.VERBOSE('Filtered Repositories', filteredRepositories)

    // Don't sort the array in place.
    const sortedRepositories = sort(byName, filteredRepositories)

    this.options.DEBUG('Sorted repository count', sortedRepositories.length)
    this.options.VERBOSE('Sorted Repositories', sortedRepositories)

    return eachSeries(sortedRepositories, (repository, callback) => {
      current++
      this.options.INFO(`Clone ${current} of ${repositoryCount} - ${repository.name}`)
      return this.clone(repository, callback)
    })
  }

  async fetchExisting () {
    this.options.DEBUG('Total existing repository count', this.options.existingGitRepos.length)
    this.options.VERBOSE('All existing repositories', this.options.existingGitRepos)

    const filteredRepositories = this.options.repositoryFilter(this.options.existingGitRepos)

    this.options.DEBUG('Filtered existing repository count', filteredRepositories.length)
    this.options.VERBOSE('Filtered existing repositories', filteredRepositories)

    if (this.options.fetchExisting === 0 || filteredRepositories.length === 0) {
      this.options.DEBUG('Nothing to fetch')
      return Promise.resolve(true)
    }

    const sortedExisting = sort(byName, filteredRepositories)
    const total = sortedExisting.length
    let current = 0
    return eachSeries(sortedExisting, (repo, callback) => {
      current++
      this.options.INFO(`Fetch ${current} of ${total} - ${repo.name}`)
      return this.fetch(repo, callback)
    })
  }

  async fetch (repo, callback) {
    const spawnParams = [`--git-dir=${path.join(this.options.cwd, repo.name, '.git')}`].concat('fetch', this.options.fetchSettings)

    this.options.DEBUG('git', spawnParams)

    const process = spawn('git', spawnParams)

    process.on('close', (status) => {
      if (status === 0) {
        this.options.DEBUG(`${repo} fetch succeeded`)
      } else {
        this.options.ERROR(`${repo} fetch failed with status ${status}`)
      }
      callback(null, true)
    })
  }

  async getRepositories (url) {
    this.options.INFO(`Requesting github repositories for ${this.options.organization} with url ${url}`)

    const response = await fetch(url, this.fetchOptions)

    if (response.status !== 200) {
      return Promise.reject(new Error(`${url} ${response.statusText}`))
    }

    const repositories = await response.json()
    const page = this.getPageInformation(response.headers.get('Link'))

    this.options.DEBUG(url, '\nPage', page, '\nPage repository count', repositories.length)
    this.options.VERBOSE('repositories', repositories)

    if (page.next) {
      const nextRepositories = await this.getRepositories(page.next)
      return repositories.concat(nextRepositories)
    }

    return repositories
  }

  getPageInformation (linkHeaders) {
    if (linkHeaders) {
      const links = linkHeaders.split(',')
      return links.reduce((accumulator, link) => {
        const sections = link.split(';')
        const url = sections[0].replace(/<(.*)>/, '$1').trim()
        const name = sections[1].replace(/rel="(.*)"/, '$1').trim()
        accumulator[name] = url
        return accumulator
      }, {})
    }
    return {}
  }
}

const byName = (left, right) => left.name.localeCompare(right.name)

module.exports = GitHub
