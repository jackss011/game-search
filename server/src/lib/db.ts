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
      await fs.promises.writeFile(this.filename, JSON.stringify(this.data))
      return true
    } else {
      return false
    }
  }
}
