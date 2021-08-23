const NodeCache = require('node-cache')

const cache = new NodeCache()

const stats = {
  hits: 0,
  miss: 0,
}

function cacheQueryId(id, params) {
  return id + '__ps__' + params.map(p => String(p)).join('__')
}

function getQuery(id, deps) {
  const key = cacheQueryId(id, deps)
  return cache.get(key)
}

function saveQuery(id, deps, value, lifespan) {
  const key = cacheQueryId(id, deps)
  cache.set(key, value, lifespan)
}

async function cachedQuery(id, deps, lifespan, resolver) {
  let value = getQuery(id, deps)

  if (value === undefined) {
    value = await resolver(deps)
    saveQuery(id, deps, value, lifespan)
    stats.miss += 1
  } else {
    stats.hits += 1
  }

  return value
}

module.exports = { cachedQuery }

setInterval(() => console.log('queries stats', stats), 5 * 1000)
