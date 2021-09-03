import fs from 'fs'

export class Writer {
  constructor(readonly filename: string) {}

  async write(data: string) {
    await fs.promises.writeFile(this.filename, data)
  }
}

export default class Db<T> {
  data: T | null = null
  private readonly writer: Writer

  constructor(private filename: string) {
    this.writer = new Writer(filename)
  }

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
      const stringData = JSON.stringify(this.data, null, spacer)

      await this.writer.write(stringData)
      return true
    } else {
      return false
    }
  }
}
