const getRepos = require('../__mocks__/repositories')
const getFilters = require('./Filter')

describe('filter', () => {
  describe('cloneFilter', () => {
    describe('excludes', () => {
      it('repository names in the existing option', () => {
        const repos = getRepos('INVAORA')

        const options = {
          existing: [
            'ullamco',
            'exercitation',
          ],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'irure',
            git_url: 'git://github.com/INVAORA/irure.git',
            ssh_url: 'git@github.com:INVAORA/irure.git',
            clone_url: 'https://github.com/INVAORA/irure.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the exclude option', () => {
        const repos = getRepos('MITROC')

        const options = {
          existing: [],
          exclude: [
            'esse',
            'irure',
            'laboris',
            'ullamco',
          ],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'culpa',
            git_url: 'git://github.com/MITROC/culpa.git',
            ssh_url: 'git@github.com:MITROC/culpa.git',
            clone_url: 'https://github.com/MITROC/culpa.git'
          },
          {
            name: 'exercitation',
            git_url: 'git://github.com/MITROC/exercitation.git',
            ssh_url: 'git@github.com:MITROC/exercitation.git',
            clone_url: 'https://github.com/MITROC/exercitation.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the excludeRegExp option', () => {
        const repos = getRepos('IDEALIS')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /^([adelL])/, // match name starting with any of these letters
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'incididunt',
            git_url: 'git://github.com/IDEALIS/incididunt.git',
            ssh_url: 'git@github.com:IDEALIS/incididunt.git',
            clone_url: 'https://github.com/IDEALIS/incididunt.git'
          },
          {
            name: 'occaecat',
            git_url: 'git://github.com/IDEALIS/occaecat.git',
            ssh_url: 'git@github.com:IDEALIS/occaecat.git',
            clone_url: 'https://github.com/IDEALIS/occaecat.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
    describe('includes', () => {
      it('repository names in the only option', () => {
        const repos = getRepos('XOGGLE')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: ['aliquip', 'laborum'],
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'aliquip',
            git_url: 'git://github.com/XOGGLE/aliquip.git',
            ssh_url: 'git@github.com:XOGGLE/aliquip.git',
            clone_url: 'https://github.com/XOGGLE/aliquip.git'
          },
          {
            name: 'laborum',
            git_url: 'git://github.com/XOGGLE/laborum.git',
            ssh_url: 'git@github.com:XOGGLE/laborum.git',
            clone_url: 'https://github.com/XOGGLE/laborum.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the onlyRegExp option', () => {
        const repos = getRepos('XINWARE')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /m$/, // match any repository ending in "m"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'cillum',
            git_url: 'git://github.com/XINWARE/cillum.git',
            ssh_url: 'git@github.com:XINWARE/cillum.git',
            clone_url: 'https://github.com/XINWARE/cillum.git'
          },
          {
            name: 'ipsum',
            git_url: 'git://github.com/XINWARE/ipsum.git',
            ssh_url: 'git@github.com:XINWARE/ipsum.git',
            clone_url: 'https://github.com/XINWARE/ipsum.git'
          },
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
    describe('combinations', () => {
      it('exclude existing before including with onlyRegEx', () => {
        const repos = getRepos('XINWARE')

        const options = {
          existing: ['cillum'],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /m$/, // match any repository ending in "m"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'ipsum',
            git_url: 'git://github.com/XINWARE/ipsum.git',
            ssh_url: 'git@github.com:XINWARE/ipsum.git',
            clone_url: 'https://github.com/XINWARE/ipsum.git'
          },
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('exclude option before including with onlyRegEx', () => {
        const repos = getRepos('QOT')

        const options = {
          existing: [],
          exclude: ['in'],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /[i]/, // match any repository containing "i"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).cloneFilter

        const expected = [
          {
            name: 'velit',
            git_url: 'git://github.com/QOT/velit.git',
            ssh_url: 'git@github.com:QOT/velit.git',
            clone_url: 'https://github.com/QOT/velit.git'
          },
          {
            name: 'exercitation',
            git_url: 'git://github.com/QOT/exercitation.git',
            ssh_url: 'git@github.com:QOT/exercitation.git',
            clone_url: 'https://github.com/QOT/exercitation.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
  })

  describe('fetchFilter', () => {
    describe('excludes', () => {
      it('repository names in the exclude option', () => {
        const repos = getRepos('MITROC')

        const options = {
          existing: [],
          exclude: [
            'esse',
            'irure',
            'laboris',
            'ullamco',
          ],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'culpa',
            git_url: 'git://github.com/MITROC/culpa.git',
            ssh_url: 'git@github.com:MITROC/culpa.git',
            clone_url: 'https://github.com/MITROC/culpa.git'
          },
          {
            name: 'exercitation',
            git_url: 'git://github.com/MITROC/exercitation.git',
            ssh_url: 'git@github.com:MITROC/exercitation.git',
            clone_url: 'https://github.com/MITROC/exercitation.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the excludeRegExp option', () => {
        const repos = getRepos('IDEALIS')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /^([adelL])/, // match name starting with any of these letters
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'incididunt',
            git_url: 'git://github.com/IDEALIS/incididunt.git',
            ssh_url: 'git@github.com:IDEALIS/incididunt.git',
            clone_url: 'https://github.com/IDEALIS/incididunt.git'
          },
          {
            name: 'occaecat',
            git_url: 'git://github.com/IDEALIS/occaecat.git',
            ssh_url: 'git@github.com:IDEALIS/occaecat.git',
            clone_url: 'https://github.com/IDEALIS/occaecat.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
    describe('includes', () => {
      it('repository names in the existing option', () => {
        const repos = getRepos('INVAORA')

        const options = {
          existing: [
            'exercitation',
          ],
          exclude: ['ullamco'],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'irure',
            git_url: 'git://github.com/INVAORA/irure.git',
            ssh_url: 'git@github.com:INVAORA/irure.git',
            clone_url: 'https://github.com/INVAORA/irure.git'
          },
          {
            name: 'exercitation',
            git_url: 'git://github.com/INVAORA/exercitation.git',
            ssh_url: 'git@github.com:INVAORA/exercitation.git',
            clone_url: 'https://github.com/INVAORA/exercitation.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the only option', () => {
        const repos = getRepos('XOGGLE')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: ['aliquip', 'laborum'],
          onlyRegExp: /.*/, // match everything
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'aliquip',
            git_url: 'git://github.com/XOGGLE/aliquip.git',
            ssh_url: 'git@github.com:XOGGLE/aliquip.git',
            clone_url: 'https://github.com/XOGGLE/aliquip.git'
          },
          {
            name: 'laborum',
            git_url: 'git://github.com/XOGGLE/laborum.git',
            ssh_url: 'git@github.com:XOGGLE/laborum.git',
            clone_url: 'https://github.com/XOGGLE/laborum.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('repository names in the onlyRegExp option', () => {
        const repos = getRepos('XINWARE')

        const options = {
          existing: [],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /m$/, // match any repository ending in "m"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'cillum',
            git_url: 'git://github.com/XINWARE/cillum.git',
            ssh_url: 'git@github.com:XINWARE/cillum.git',
            clone_url: 'https://github.com/XINWARE/cillum.git'
          },
          {
            name: 'ipsum',
            git_url: 'git://github.com/XINWARE/ipsum.git',
            ssh_url: 'git@github.com:XINWARE/ipsum.git',
            clone_url: 'https://github.com/XINWARE/ipsum.git'
          },
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
    describe('combinations', () => {
      it('ignores existing and includes with onlyRegEx', () => {
        const repos = getRepos('XINWARE')

        const options = {
          existing: ['cillum'],
          exclude: [],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /m$/, // match any repository ending in "m"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'cillum',
            git_url: 'git://github.com/XINWARE/cillum.git',
            ssh_url: 'git@github.com:XINWARE/cillum.git',
            clone_url: 'https://github.com/XINWARE/cillum.git'
          },
          {
            name: 'ipsum',
            git_url: 'git://github.com/XINWARE/ipsum.git',
            ssh_url: 'git@github.com:XINWARE/ipsum.git',
            clone_url: 'https://github.com/XINWARE/ipsum.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
      it('exclude option before including with onlyRegEx', () => {
        const repos = getRepos('QOT')

        const options = {
          existing: [],
          exclude: ['in'],
          excludeRegExp: /$^/, // match nothing
          only: undefined,
          onlyRegExp: /[i]/, // match any repository containing "i"
          DEBUG: jest.fn(),
          ERROR: jest.fn(),
          VERBOSE: jest.fn(),
        }
        const filter = getFilters(options).fetchFilter

        const expected = [
          {
            name: 'velit',
            git_url: 'git://github.com/QOT/velit.git',
            ssh_url: 'git@github.com:QOT/velit.git',
            clone_url: 'https://github.com/QOT/velit.git'
          },
          {
            name: 'exercitation',
            git_url: 'git://github.com/QOT/exercitation.git',
            ssh_url: 'git@github.com:QOT/exercitation.git',
            clone_url: 'https://github.com/QOT/exercitation.git'
          }
        ]

        const actual = filter(repos)

        expect(actual).toEqual(expected)
      })
    })
  })
})
