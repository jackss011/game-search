import { Low, JSONFile } from 'lowdb'

export type Options = Partial<{
  cache: boolean | number
  expires: false | number
  refresh: number
}>

export type Def = {
  key: string
  callback: Callback
  options: Options
}

type SavedData = {
  queries: Record<string, any>
}

type Callback = (params: any[]) => Promise<any>

export default class Scraper {
  private readonly db: Low<SavedData>
  private readonly definitions: Record<string, Def> = {}
  readonly stats: Record<string, { hits: number; miss: number }> = {}
  private readonly pendingQueries: Record<string, Promise<unknown> | null> = {}
  private savedQueries: Record<string, any> = {}

  private readonly initalized: Promise<void>

  constructor(readonly dbName: string) {
    this.db = new Low(new JSONFile(`./${dbName}-scraper.db.json`))

    const doInit = async () => {
      await this.db.read()
      if (!this.db.data) this.db.data = { queries: {} }
      this.savedQueries = this.db.data.queries

      const keys = Object.keys(this.savedQueries).filter(k =>
        k.includes('steamdb')
      )

      console.log('cached steamdb price history count:', keys.length)
    }

    this.initalized = doInit()
  }

  getCachedQuery(
    key: string,
    params: any[],
    expires?: number | false,
    refresh?: number
  ) {
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

  saveCachedQuery(key: string, params: any[], value: any) {
    const id = queryId(key, params)

    this.savedQueries[id] = {
      timestamp: Date.now(),
      value,
    }
  }

  define(key: string, options: Options, callback: Callback) {
    if (this.definitions[key]) {
      throw new Error('Duplicate key = ' + key)
    }

    if (typeof options !== 'object' || typeof callback !== 'function') {
      throw new TypeError('Invalid scraper definition')
    }

    // validate options
    // if (options.cache) {
    //   if (options.expires === true) {
    //     throw new TypeError('expires cannot be true')
    //   }

    //   // if((typeof options.expires))
    // }

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

  _query(key: string, params: any[], save: boolean, throwError: boolean) {
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
          if (throwError) {
            throw e
          } else {
            // log this one
          }
        } finally {
          this.pendingQueries[id] = null
        }
      }

      this.pendingQueries[id] = pendingQuery = retrievePromise()
    }

    return pendingQuery
  }

  async perform(key: string, params: any[], immediate: boolean = false) {
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
        if (needsRefresh) this._query(key, params, true, false)
        return cachedValue
      }
    }

    // get or create query
    const pendingQuery = this._query(key, params, cache as any, !immediate)

    // if immediate return null else await promise resolution
    return immediate ? null : await pendingQuery
  }

  save() {
    this.db.write()

    console.log('scraper stats', this.stats)
  }
}

function isDead(timestamp: number, lifetime: number, now?: number) {
  if (!now) now = Date.now()

  return now - timestamp > lifetime * 1000
}

function queryId(key: string, params: any[]) {
  return 'query__' + key + '__params__' + params.map(p => String(p)).join('__')
}

export class FetchError extends Error {
  constructor(message: string, public original: Error) {
    super(message || 'Scraper: error during fetch operation')
    this.name = 'FetchError'
  }
}

export class DataError extends Error {
  constructor(message: string) {
    super(message || 'Scraper: unexpected data from fetch')
    this.name = 'DataError'
  }
}
