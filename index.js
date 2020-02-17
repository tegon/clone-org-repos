const yargs = require('yargs')
const fs = require('fs')
const getFilters = require('./lib/Filter')
const GitHub = require('./lib/GitHub')
const path = require('path')

const options = yargs
  .usage('Usage: $0 [options]')
  .example('$0 facebook -t <GITHUB_TOKEN>', 'Clone all repositories in the facebook organization')
  .example('$0 dalelotts -t <GITHUB_TOKEN> -c users', 'Clone all repositories in the user dalelotts')
  .env('CLONEORG')
  .config('json')
  .alias('j', 'json')
  .option('t', {
    alias: 'token',
    default: process.env.GITHUB_TOKEN,
    demandOption: true,
    describe: 'GitHub access Token.',
    nargs: 1,
    type: 'string'
  })
  .option('g', {
    alias: 'group',
    choices: ['orgs', 'users'],
    default: 'orgs',
    demandOption: false,
    describe: 'GitHub organizations or users.',
    nargs: 1,
    type: 'string',
  })
  .option('p', {
    alias: 'protocol',
    choices: ['git', 'ssh', 'https'],
    default: 'ssh',
    demandOption: false,
    describe: 'GitHub access protocol.',
    nargs: 1,
    type: 'string',
  })
  .option('n', {
    alias: 'perPage',
    default: 100,
    demandOption: false,
    describe: 'Number of repos per page',
    nargs: 1,
    type: 'number'
  })
  .option('r', {
    alias: 'type',
    choices: ['all', 'public', 'private', 'forks', 'sources', 'member'],
    default: 'all',
    demandOption: false,
    describe: 'Type of repositories to include.',
    nargs: 1,
    type: 'string',
  })
  .option('o', {
    alias: 'only',
    default: [],
    demandOption: false,
    describe: 'Space delimited list of the repository names to clone.',
    type: 'array',
  })
  .option('i', {
    alias: 'onlyRegExp',
    coerce: arg => new RegExp(arg),
    default: '.*',
    demandOption: false,
    describe: 'Regular expression that matches the repository names to clone.',
    nargs: 1,
    type: 'string',
  })
  .option('e', {
    alias: 'exclude',
    default: [],
    demandOption: false,
    describe: 'Space delimited list of repository names to exclude.',
    type: 'array'
  })
  .option('x', {
    alias: 'excludeRegExp',
    coerce: arg => new RegExp(arg),
    default: '$^',
    demandOption: false,
    describe: 'Regular expression that matches the repository names to exclude.',
    nargs: 1,
    type: 'string',
  })
  .option('c', {
    alias: 'cloneSettings',
    default: [],
    demandOption: false,
    describe: 'Space delimited list of additional options to pass to git clone command.',
    type: 'array'
  })
  .option('f', {
    alias: 'fetch',
    default: 0,
    demandOption: false,
    describe: 'Fetch (not pull) existing repositories. -ff to skip cloning and fetch only.',
    type: 'boolean',
    count: true
  })
  .option('s', {
    alias: 'fetchSettings',
    default: ['--all'],
    demandOption: false,
    describe: 'Space delimited list of additional options to pass to git fetch command.',
    type: 'array'
  })
  .option('d', {
    alias: 'debug',
    default: false,
    demandOption: false,
    describe: 'Enable debug mode.',
    count: true,
    type: 'boolean'
  })
  .string('_')
  .demandCommand(1, 1, 'Please specify a non-option argument for organization or user name', 'Only one non-option argument is allowed')
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilog('copyright 2020')
  .wrap(yargs.terminalWidth())
  .strict()
  .argv

options.INFO = function () {
  console.info.apply(console, arguments)
}

options.DEBUG = function () {
  options.debug && console.debug.apply(console, arguments)
}

options.ERROR = function () {
  console.error.apply(console, arguments)
}

options.VERBOSE = function () {
  options.debug > 1 && console.debug.apply(console, arguments)
}

options.cwd = process.cwd()
options.organization = options._[0]
options.existing = getExisting(options.cwd)
options.existingGitRepos = options.existing.filter(isGitRepo(options.cwd)).map((name) => ({ name }))

const filters = getFilters(options)
options.cloneFilter = filters.cloneFilter
options.fetchFilter = filters.fetchFilter

options.VERBOSE(options)

new GitHub(options).cloneRepositories()
  .then(result => {
    console.log('Done', result)
  })
  .catch(error => {
    options.INFO(error.message)
    options.DEBUG(error)
    process.exit(1)
  })

function getExisting (directory) {
  return fs.readdirSync(directory).filter(function (child) {
    return fs.statSync(path.join(directory, child)).isDirectory()
  })
}

function isGitRepo (directory) {
  return (child) => fs.existsSync(path.join(directory, child, '.git'))
}
