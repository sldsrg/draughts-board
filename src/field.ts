export class Field {
  public static parse(s: string): number {
    const row = 8 - parseInt(s[1], 10)
    const column = 'abcdefgh'.indexOf(s[0])
    return ((row << 3) + column)
  }

  public static fromIndex(i: number): Field {
    const row = i >> 3
    const column = i - (row << 3)
    return new Field(row, column)
  }

  constructor(public row: number, public column: number) { }

  public next(rowStep: number, columnStep: number): Field {
    return new Field(this.row + rowStep, this.column + columnStep)
  }

  public nextTo(target: Field): Field {
    return new Field(
      target.row + (target.row - this.row > 0 ? 1 : -1),
      target.column + (target.column - this.column > 0 ? 1 : -1)
    )
  }

  public equals(that: Field | null): boolean {
    if (!that) return false
    return this.row === that.row && this.column === that.column
  }

  public toString() {
    return 'abcdefgh'.charAt(this.column) + (8 - this.row).toString()
  }
}
