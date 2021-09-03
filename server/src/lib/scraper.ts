// import { Low, JSONFile } from 'lowdb'
// import { Writer } from 'steno'
import Db from './db'

// Scraper query options
export type Options = Partial<{
  cache: boolean | number
  expires: false | number
  refresh: number
}>

// Scraper permorm scaping function
type Callback = (params: any[]) => Promise<any>

// Scraper query definition
export type Def = {
  key: string
  callback: Callback
  options: Options
}

// used to perfirm a query
interface Query<R> {
  key: string
  options: Options
  perform: (params: any[], immediate?: boolean) => Promise<R>
}

type SavedData = {
  queries: Record<string, any>
}

/**
 *
 */
export default class Scraper {
  /**  */
  private readonly definitions: Record<string, Def> = {}
  /** */
  private readonly pendingQueryPromises: Record<
    string,
    Promise<unknown> | null
  > = {}

  /** hit/miss statics divided by key */
  readonly stats: Record<string, { hits: number; miss: number }> = {}
  /** use await on this promise to wait for data read */
  private readonly initalized: Promise<void>
  /** local json file db instance, used to cache query results */
  private readonly db: Db<SavedData>

  /**
   * Create a scraper instance
   * @param dbName used to determine file name as such: `<dbName>.db.json`   */
  constructor(readonly dbName: string = 'default') {
    this.db = new Db(`./${dbName}-scraper.db.json`)
    // this.writer = new Writer(this.dbFilename)

    const doInit = async () => {
      await this.db.read()

      if (!this.db.data) this.db.data = { queries: {} }

      const keys = Object.keys(this.db.data.queries).filter(k =>
        k.includes('steamdb')
      )

      console.log('cached steamdb price history count:', keys.length)
    }

    this.initalized = doInit()
  }

  /**
   * Retrieve last query result
   * @param key
   * @param params
   * @param expires
   * @param refresh
   * @returns
   */
  #getCachedQuery(
    key: string,
    params: any[],
    expires?: number | false,
    refresh?: number
  ) {
    const id = queryId(key, params)
    const cachedQuery = this.db.data!.queries[id]
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

  /**
   *
   * @param key
   * @param params
   * @param value
   */
  #saveCachedQuery(key: string, params: any[], value: any) {
    const id = queryId(key, params)

    this.db.data!.queries[id] = {
      timestamp: Date.now(),
      value,
    }
  }

  /**
   *
   * @param key
   * @param params
   * @param save
   * @param throwError
   * @returns
   */
  #query(key: string, params: any[], save: boolean, throwError: boolean) {
    const def = this.definitions[key]
    const id = queryId(key, params)
    let pendingQuery = this.pendingQueryPromises[id]

    // if does not have pending promise create one
    if (!pendingQuery) {
      // call this function to perform the query
      const retrievePromise = async () => {
        // scrape actual value
        try {
          const value = await def.callback(params)

          // save to cache
          if (save) {
            this.#saveCachedQuery(key, params, value)
          }

          return value
        } catch (e) {
          if (throwError) {
            throw e
          } else {
            // log this one
          }
        } finally {
          this.pendingQueryPromises[id] = null
        }
      }

      this.pendingQueryPromises[id] = pendingQuery = retrievePromise()
    }

    return pendingQuery
  }

  /**
   *
   * @param key
   * @param params
   * @param immediate
   * @returns
   */
  async #perform(key: string, params: any[], immediate: boolean = false) {
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
      const [cachedValue, needsRefresh] = this.#getCachedQuery(
        key,
        params,
        expires,
        refresh
      )

      if (cachedValue) {
        // refresh if needed
        if (needsRefresh) this.#query(key, params, true, false)
        return cachedValue
      }
    }

    // get or create query
    const pendingQuery = this.#query(key, params, cache as any, !immediate)

    // if immediate return null else await promise resolution
    return immediate ? null : await pendingQuery
  }

  /**
   *
   * @param key
   * @param options
   * @param callback
   * @returns
   */
  define<R>(key: string, options: Options, callback: Callback): Query<R> {
    if (this.definitions[key]) {
      throw new Error('Duplicate key = ' + key)
    }

    if (typeof options !== 'object' || typeof callback !== 'function') {
      throw new TypeError('Invalid scraper definition')
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

    return {
      key,
      options: { ...options },
      perform: async (params: any[], immediate: boolean = false) =>
        (await this.#perform(key, params, immediate)) as R,
      // performImmediate: <R>(params: any[]) => await this.perform(key, params)
    }
  }

  /**
   *
   */
  save() {
    // this.writer.write(JSON.stringify(this.data))
    this.db.write()

    console.log('scraper stats', this.stats)
  }
}

/**
 *
 * @param timestamp
 * @param lifetime
 * @param now
 * @returns
 */
function isDead(timestamp: number, lifetime: number, now?: number) {
  if (!now) now = Date.now()

  return now - timestamp > lifetime * 1000
}

/**
 *
 * @param key
 * @param params
 * @returns
 */
function queryId(key: string, params: any[]) {
  return 'query__' + key + '__params__' + params.map(p => String(p)).join('__')
}

/**
 *
 */
export class FetchError extends Error {
  constructor(message: string, public original: Error) {
    super(message || 'Scraper: error during fetch operation')
    this.name = 'FetchError'
  }
}

/**
 *
 */
export class DataError extends Error {
  constructor(message: string) {
    super(message || 'Scraper: unexpected data from fetch')
    this.name = 'DataError'
  }
}
