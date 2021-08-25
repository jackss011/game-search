import { Low, JSONFile } from 'lowdb'

export default class Scraper {
  constructor(dbName) {
    this.db = new Low(new JSONFile(`./${dbName}-scraper.db.json`))
    this.definitions = {}
    this.stats = {}

    this.pendingQueries = {}

    this.initalized = (async () => {
      await this.db.read()
      if (!this.db.data) this.db.data = { queries: {}, limit: {} }
      this.savedQueries = this.db.data.queries

      const keys = Object.keys(this.savedQueries).filter(k =>
        k.includes('steamdb')
      )

      console.log('cached steamdb price history count:', keys.length)
    })()
  }

  getCachedQuery(key, params, lifetime) {
    const id = queryId(key, params)
    const cachedQuery = this.savedQueries[id]

    if (cachedQuery && Date.now() - cachedQuery.timestamp <= lifetime * 1000) {
      this.stats[key].hits += 1
      return cachedQuery.value
    } else {
      this.stats[key].miss += 1
      return null
    }
  }

  saveCachedQuery(key, params, value) {
    const id = queryId(key, params)

    this.savedQueries[id] = {
      timestamp: Date.now(),
      value,
    }
  }

  define(key, options, callback) {
    if (this.definitions[key]) {
      throw new Error('Duplicate key = ' + key)
    }

    if (typeof options !== 'object' || typeof callback !== 'function') {
      throw new TypeError('Invalid scraper definition')
    }

    this.stats[key] = { hits: 0, miss: 0 }

    this.definitions[key] = {
      key,
      options,
      callback,
    }

    return this
  }

  async perform(key, params, immediate) {
    await this.initalized

    const def = this.definitions[key]

    if (!def) {
      throw new Error('Unkown key = ' + key)
    }

    const { cache } = def.options

    // retrieve from cache
    if (cache) {
      const cachedValue = this.getCachedQuery(key, params, cache)
      if (cachedValue) return cachedValue
    }

    // check if has pending promise with same query (ley + params)
    const id = queryId(key, params)
    let pendingQuery = this.pendingQueries[id]

    // if does not have pending promise create one
    if (!pendingQuery) {
      const retrievePromise = async () => {
        // scrape actual value
        try {
          const value = await def.callback(params)

          // save to cache
          if (cache) {
            this.saveCachedQuery(key, params, value)
          }

          return value
        } catch (e) {
          if (immediate) {
            // should log this
          } else {
            throw e
          }
        } finally {
          this.pendingQueries[id] = null
        }
      }

      this.pendingQueries[id] = pendingQuery = retrievePromise(id)
    }

    // if immediate return null else await promise resolution
    return immediate ? null : await pendingQuery
  }

  save() {
    this.db.write()

    console.log('scraper stats', this.stats)
  }
}

function queryId(key, params) {
  return 'query__' + key + '__params__' + params.map(p => String(p)).join('__')
}
