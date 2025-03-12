export class ToCBuilder {
  private things: {name: string, offset: number, total: number}[] = []

  addThing(name: string, offset: number, total: number) {
    this.things.push({name, offset, total})

    return this
  }

  build(): string[][] {
    const columns = Math.max(...this.things.map(({ offset }) => offset)) + 1
    const result: string[][] = []

    const header = new Array(columns - 1).fill('').map((_, i) => `Header ${i+1}`)
    header.push('Total')
    result.push(header)

    for (const { name, offset, total } of this.things) {
      const row = new Array(columns).fill('')
      row[offset - 1] = name
      row[columns - 1] = total > 0 ? total : ''
      result.push(row)
    }

    return result
  }
}