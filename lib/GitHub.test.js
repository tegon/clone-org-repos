const EventEmitter = require('events')
const fetch = require('node-fetch')
const getRepos = require('../__mocks__/repositories')
const GitHub = require('./GitHub')
const { filter } = require('ramda')
const { spawn } = require('child_process')

jest.mock('node-fetch')
jest.mock('child_process')

describe('GitHub', function () {
  let gitHub

  beforeEach(() => {
    fetch.mockClear()
    spawn.mockClear()
  })

  describe('clone', () => {
    beforeEach(() => {
      gitHub = new GitHub({
        cwd: '/',
        excludeRegExp: /^bar/,
        existing: [],
        existingGitRepos: [],
        fetchExisting: 0,
        cloneSettings: '--recurse-submodules',
        group: 'users',
        onlyRegExp: /foo-*/,
        organization: 'foo',
        perPage: 10,
        protocol: 'https',
        repositoryFilter: filter(() => true),
        type: 'forks',
        DEBUG: jest.fn(),
        ERROR: jest.fn(),
        INFO: jest.fn(),
        VERBOSE: jest.fn(),
      })
    })

    describe('getPageInformation', () => {
      it('includes next link when present', () => {
        const linkHeaders = '<https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2>; rel="next", <https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2>; rel="last"'
        const actual = gitHub.getPageInformation(linkHeaders)
        expect(actual.next).toBe('https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2')
      })
      it('omits next link when missing', () => {
        const linkHeaders = '<https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=1>; rel="prev", <https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=1>; rel="first"'
        const actual = gitHub.getPageInformation(linkHeaders)
        expect(actual.next).toBeUndefined()
      })
      it('omits next link when link headers are undefined', () => {
        const actual = gitHub.getPageInformation()
        expect(actual.next).toBeUndefined()
      })
    })
    describe('cloneRepositories', () => {
      it('fails if Github api returns 404', async () => {
        expect.assertions(2)
        const response = {
          json: jest.fn(),
          headers: {
            get: jest.fn()
          },
          status: 404,
          statusText: 'Not found',
        }

        fetch.mockReturnValue(response)

        gitHub.clone = jest.fn((repository, callback) => callback(null, true))

        await expect(gitHub.cloneRepositories()).rejects.toEqual(new Error('https://api.github.com/users/foo/repos?per_page=10&type=forks Not found'))
        expect(fetch).toHaveBeenCalledTimes(1)
      })

      it('queries Github api for repositories until no next page available', async () => {
        const hasNextHeaders = '<https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2>; rel="next", <https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=2>; rel="last"'
        const noNextHeaders = '<https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=1>; rel="prev", <https://api.github.com/organizations/139426/repos?per_page=100&type=all&page=1>; rel="first"'

        const firstPage = getRepos('INVAORA')
        const secondPage = getRepos('PHARMEX')

        const response = {
          json: jest.fn(),
          headers: {
            get: jest.fn()
          },
          status: 200
        }
        response.json.mockReturnValueOnce(Promise.resolve(firstPage))
        response.json.mockReturnValueOnce(Promise.resolve(secondPage))
        response.json.mockReturnValue(Promise.resolve([]))
        response.headers.get.mockReturnValueOnce(hasNextHeaders)
        response.headers.get.mockReturnValueOnce(noNextHeaders)
        response.headers.get.mockReturnValue(undefined)

        fetch.mockReturnValue(response)

        gitHub.clone = jest.fn((repository, callback) => callback(null, true))

        return gitHub.cloneRepositories().then(() => {
          expect(fetch).toHaveBeenCalledTimes(2)
        })
      })

      it('clones in lexical order', () => {
        const repositories = [
          { name: 'Arthur-Dent' },
          { name: 'zaphod' },
          { name: 'Beeblebrox' }
        ]

        gitHub.getRepositories = jest.fn(url => Promise.resolve(repositories))
        gitHub.clone = jest.fn((repository, callback) => callback(null, true))

        return gitHub.cloneRepositories().then(() => {
          expect(gitHub.getRepositories).toHaveBeenCalledWith('https://api.github.com/users/foo/repos?per_page=10&type=forks')
          expect(gitHub.clone).toHaveBeenCalledTimes(3)
          // repos should be sorted by name
          expect(gitHub.clone).toHaveBeenNthCalledWith(1, { name: 'Arthur-Dent' }, expect.anything())
          expect(gitHub.clone).toHaveBeenNthCalledWith(2, { name: 'Beeblebrox' }, expect.anything())
          expect(gitHub.clone).toHaveBeenNthCalledWith(3, { name: 'zaphod' }, expect.anything())
        })
      })
    })
    describe('clone', () => {
      describe('ssh access', () => {
        beforeEach(() => {
          fetch.mockClear()
          spawn.mockClear()
          gitHub = new GitHub({
            cwd: '/',
            exclude: [],
            fetchExisting: 0,
            cloneSettings: '--recurse-submodules',
            group: 'orgs',
            only: 'foo-*',
            organization: 'ssh-access',
            perPage: 10,
            protocol: 'ssh',
            repositoryFilter: filter(() => true),
            type: 'all',
            DEBUG: jest.fn(),
            ERROR: jest.fn(),
            INFO: jest.fn(),
            VERBOSE: jest.fn(),
          })
        })

        it('uses ssh url', (done) => {
          const repository = {
            name: 'ford-prefect',
            git_url: 'git://github.com/douglas-adams/ford-prefect.git',
            ssh_url: 'git@github.com:douglas-adams/ford-prefect.git',
            clone_url: 'https://github.com/douglas-adams/ford-prefect.git'
          }

          const spawnEvent = new EventEmitter()
          spawn.mockReturnValue(spawnEvent)
          gitHub.clone(repository, () => {
            expect(spawn).toHaveBeenCalledWith('git', ['clone', '--recurse-submodules', repository.ssh_url])
            expect(gitHub.options.DEBUG).toHaveBeenCalledTimes(2)
            done()
          })

          spawnEvent.emit('close', 0)
        })

        it('logs non-zero result', (done) => {
          const repository = {
            name: 'ford-prefect',
            git_url: 'git://github.com/douglas-adams/ford-prefect.git',
            ssh_url: 'git@github.com:douglas-adams/ford-prefect.git',
            clone_url: 'https://github.com/douglas-adams/ford-prefect.git'
          }

          const spawnEvent = new EventEmitter()
          spawn.mockReturnValue(spawnEvent)
          gitHub.clone(repository, () => {
            expect(spawn).toHaveBeenCalledWith('git', ['clone', '--recurse-submodules', repository.ssh_url])
            expect(gitHub.options.ERROR).toHaveBeenCalledTimes(1)
            expect(gitHub.options.DEBUG).toHaveBeenCalledTimes(1)
            done()
          })

          spawnEvent.emit('close', 128)
        })
      })
    })
  })

  describe('fetch phase', () => {
    beforeEach(() => {
      gitHub = new GitHub({
        cwd: '/',
        excludeRegExp: /^bar/,
        existing: [],
        existingGitRepos: [],
        fetchExisting: 1,
        fetchSettings: '--all',
        cloneSettings: '--recurse-submodules',
        group: 'users',
        onlyRegExp: /foo-*/,
        organization: 'foo',
        perPage: 10,
        protocol: 'https',
        repositoryFilter: filter(() => true),
        type: 'forks',
        DEBUG: jest.fn(),
        ERROR: jest.fn(),
        INFO: jest.fn(),
        VERBOSE: jest.fn(),
      })
    })

    describe('fetchExisting', () => {
      it('skips fetch if there are no existing repositories', async () => {
        expect.assertions(1)
        await gitHub.fetchExisting()
        expect(gitHub.options.DEBUG).toHaveBeenCalledWith('Nothing to fetch')
      })

      it('fetches existing repos in lexical order', async () => {
        gitHub.options.existingGitRepos = [{ name: 'telephone-sanitizer' }, { name: 'garkbit' }]

        gitHub.fetch = jest.fn((relativePath, callback) => callback(null, true))

        await gitHub.fetchExisting()
        expect(gitHub.fetch).toHaveBeenNthCalledWith(1, { name: 'garkbit' }, expect.anything())
        expect(gitHub.fetch).toHaveBeenNthCalledWith(2, { name: 'telephone-sanitizer' }, expect.anything())
      })
      it('applies filter for fetching repos', async () => {
        gitHub.options.repositoryFilter = filter((repo) => repo.name === 'telephone-sanitizer')
        gitHub.options.existingGitRepos = [{ name: 'telephone-sanitizer' }, { name: 'garkbit' }]

        gitHub.fetch = jest.fn((relativePath, callback) => callback(null, true))

        await gitHub.fetchExisting()
        expect(gitHub.fetch).toHaveBeenCalledWith({ name: 'telephone-sanitizer' }, expect.anything())
      })
    })

    describe('fetch', () => {
      it('passes fetch settings', (done) => {
        const repository = { name: 'slartibartfast' }

        const spawnEvent = new EventEmitter()
        spawn.mockReturnValue(spawnEvent)
        gitHub.fetch(repository, () => {
          expect(spawn).toHaveBeenCalledWith('git', ['--git-dir=/slartibartfast/.git', 'fetch', '--all'])
          expect(gitHub.options.DEBUG).toHaveBeenCalledTimes(2)
          done()
        })

        spawnEvent.emit('close', 0)
      })

      it('logs non-zero result', (done) => {
        const repository = { name: 'fenchurch' }

        const spawnEvent = new EventEmitter()
        spawn.mockReturnValue(spawnEvent)
        gitHub.fetch(repository, () => {
          expect(spawn).toHaveBeenCalledWith('git', ['--git-dir=/fenchurch/.git', 'fetch', '--all'])
          expect(gitHub.options.ERROR).toHaveBeenCalledTimes(1)
          expect(gitHub.options.DEBUG).toHaveBeenCalledTimes(1)
          done()
        })

        spawnEvent.emit('close', 128)
      })
    })

    describe('only', () => {
      beforeEach(() => {
        gitHub = new GitHub({
          excludeRegExp: /^bar/,
          existing: [],
          existingGitRepos: [],
          fetch: 2,
          cloneSettings: '--recurse-submodules',
          group: 'users',
          onlyRegExp: /foo-*/,
          organization: 'foo',
          perPage: 10,
          protocol: 'https',
          repositoryFilter: filter(() => true),
          type: 'forks',
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          INFO: jest.fn(),
          VERBOSE: jest.fn(),
        })
      })

      it('skips clone', async () => {
        expect.assertions(2)
        gitHub.fetchExisting = jest.fn()
        gitHub.getRepositories = jest.fn()

        await gitHub.cloneRepositories()

        expect(gitHub.fetchExisting).toHaveBeenCalled()
        expect(gitHub.getRepositories).not.toHaveBeenCalled()
      })
    })
  })
})
