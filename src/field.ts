export class Field {
  public static fromString(s: string): Field {
    const row = 8 - parseInt(s[1], 10)
    const column = 'abcdefgh'.indexOf(s[0])
    return new Field(row, column)
  }

  constructor(public row: number, public column: number) {}

  public toString() {
    return 'abcdefgh'.charAt(this.column) + (8 - this.row).toString()
  }
}
