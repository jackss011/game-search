import fs from 'fs'

export default class Db<T> {
  data: T | null = null

  constructor(private filename: string) {}

  async read(): Promise<T | null> {
    try {
      this.data = JSON.parse(
        await fs.promises.readFile(this.filename, 'utf-8')
      ) as T
    } catch (e) {}

    return this.data
  }

  async write() {
    if (this.data) {
      const spacer = process.env.NODE_ENV === 'development' ? 2 : undefined
      await fs.promises.writeFile(
        this.filename,
        JSON.stringify(this.data, null, spacer)
      )
      return true
    } else {
      return false
    }
  }
}
