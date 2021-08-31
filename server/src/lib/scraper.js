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

  getCachedQuery(key, params, expires, refresh) {
    const id = queryId(key, params)
    const cachedQuery = this.savedQueries[id]
    const now = Date.now()

    if (cachedQuery) {
      const isExpired =
        expires !== false &&
        typeof expires === 'number' &&
        isDead(cachedQuery.timestamp, expires, now)

      const needsRefresh =
        refresh && isDead(cachedQuery.timestamp, refresh, now)

      if (!isExpired) {
        this.stats[key].hits += 1
        return [cachedQuery.value, needsRefresh]
      }
    }

    this.stats[key].miss += 1
    return [null, false]
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

    // validate options
    if (options.cache) {
      if (options.expires === true) {
        throw new TypeError('expires cannot be true')
      }

      // if((typeof options.expires))
    }

    this.stats[key] = {
      hits: 0,
      miss: 0,
    }

    // create definition
    this.definitions[key] = {
      key,
      options,
      callback,
    }

    return this
  }

  _query(key, params, save) {
    const def = this.definitions[key]
    const id = queryId(key, params)
    let pendingQuery = this.pendingQueries[id]

    // if does not have pending promise create one
    if (!pendingQuery) {
      // call this function to perform the query
      const retrievePromise = async () => {
        // scrape actual value

        try {
          const value = await def.callback(params)

          // save to cache
          if (save) {
            this.saveCachedQuery(key, params, value)
          }

          return value
        } catch (e) {
          console.error('Failed to fetch steamDB for', params[0])
          console.error(e)
        } finally {
          this.pendingQueries[id] = null
        }
      }

      this.pendingQueries[id] = pendingQuery = retrievePromise(id)
    }

    return pendingQuery
  }

  async perform(key, params, immediate) {
    await this.initalized

    // get definition
    const def = this.definitions[key]

    if (!def) {
      throw new Error('Unkown key = ' + key)
    }

    // parse option
    let { cache, expires, refresh } = def.options

    if (typeof cache === 'number') {
      expires = cache
    }

    // try to retrieve from cache
    if (cache) {
      const [cachedValue, needsRefresh] = this.getCachedQuery(
        key,
        params,
        expires,
        refresh
      )

      if (cachedValue) {
        // refresh if needed
        if (needsRefresh) this._query(key, params, true)
        return cachedValue
      }
    }

    // get or create query
    const pendingQuery = this._query(key, params, cache)

    // if immediate return null else await promise resolution
    return immediate ? null : await pendingQuery
  }

  save() {
    this.db.write()

    console.log('scraper stats', this.stats)
  }
}

function isDead(timestamp, lifetime, now) {
  if (!now) now = Date.now()

  if (
    typeof timestamp !== 'number' ||
    typeof lifetime !== 'number' ||
    typeof now !== 'number'
  ) {
    throw new TypeError('Invalid parameters')
  }

  return now - timestamp > lifetime * 1000
}

function queryId(key, params) {
  return 'query__' + key + '__params__' + params.map(p => String(p)).join('__')
}
