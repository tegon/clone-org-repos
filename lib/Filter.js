const { compose, filter, not } = require('ramda')

function getFilters (options) {
  options.VERBOSE('Understanding verbose filter messages: true **ALWAYS** means the repository is included and false **ALWAYS** means it is excluded.')
  options.VERBOSE('if **ALL** filters return "true" then the repo **IS** cloned')
  options.VERBOSE('if **ANY** filter returns "false" then the repo **IS NOT** cloned)')

  const excludeExisting = repo => {
    const result = !options.existing.includes(repo.name)
    options.VERBOSE(repo.name, result, 'existing')
    return result
  }

  const exclude = repo => {
    const result = not(options.exclude.includes(repo.name))
    options.VERBOSE(repo.name, result, 'exclude')
    return result
  }

  const excludeRegEx = repo => {
    const result = not(options.excludeRegExp.test(repo.name))
    options.VERBOSE(repo.name, result, 'excludeRegEx')
    return result
  }

  const include = getIncludeFilter(options)

  const includeRegEx = (repo) => {
    const result = options.onlyRegExp.test(repo.name)
    options.VERBOSE(repo.name, result, 'onlyRegExp')
    return result
  }

  return {
    cloneFilter: compose(
      filter(exclude),
      filter(excludeExisting),
      filter(excludeRegEx),
      filter(include),
      filter(includeRegEx)
    ),
    // fetch filter should not exclude existing
    fetchFilter: compose(
      filter(exclude),
      filter(excludeRegEx),
      filter(include),
      filter(includeRegEx)
    )
  }
}

function getIncludeFilter (options) {
  if (options.only && options.only.length) {
    return repo => {
      const result = options.only.includes(repo.name)
      options.VERBOSE(repo.name, result, 'include filter')
      return result
    }
  }
  return () => true
}

module.exports = getFilters
