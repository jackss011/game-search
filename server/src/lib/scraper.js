import { Low, JSONFile } from 'lowdb'

export default class Scraper {
  constructor(dbName) {
    this.db = new Low(new JSONFile(`./${dbName}-scraper.db.json`))
    this.definitions = {}
    this.stats = {
      miss: 0,
      hits: 0,
    }

    this.initalized = (async () => {
      await this.db.read()
      if (!this.db.data) this.db.data = { queries: {}, limit: {} }
      this.queries = this.db.data.queries
    })()
  }

  define(key, options, callback) {
    if (this.definitions[key]) {
      throw new Error('Duplicate key = ' + key)
    }

    if (typeof options !== 'object' || typeof callback !== 'function') {
      throw new TypeError('Invalid scraper definition')
    }

    this.definitions[key] = {
      key,
      options,
      callback,
    }

    return this
  }

  async perform(key, params) {
    await this.initalized

    const def = this.definitions[key]

    if (!def) {
      throw new Error('Unkown key = ' + key)
    }

    const { cache } = def.options

    // retrieve from cache
    if (cache) {
      const id = queryId(key, params)
      const q = this.queries[id]

      if (q && Date.now() - q.timestamp <= cache * 1000) {
        this.stats.hits += 1
        return q.value
      } else {
        this.stats.miss += 1
      }
    }

    // scrape actual value
    const value = await def.callback(params)

    // save to cache
    if (cache) {
      const id = queryId(key, params)
      this.queries[id] = {
        timestamp: Date.now(),
        value,
      }
    }

    return value
  }

  save() {
    this.db.write()

    console.log('scraper stats', this.stats)
  }
}

function queryId(key, params) {
  return 'query__' + key + '__params__' + params.map(p => String(p)).join('__')
}

// module.exports = Scraper
