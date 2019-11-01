import { Vector } from './vector'

export class Field {
  public static fromString(s: string): Field {
    const row = 8 - parseInt(s[1], 10)
    const column = 'abcdefgh'.indexOf(s[0])
    return new Field(row, column)
  }

  constructor(public row: number, public column: number) { }

  public next(rowStep: number, columnStep: number): Field {
    return new Field(this.row + rowStep, this.column + columnStep)
  }

  public shift({ deltaRow, deltaColumn }: Vector): Field {
    return new Field(
      this.row + deltaRow,
      this.column + deltaColumn
    )
  }

  public nextTo(target: Field): Field {
    return new Field(
      target.row + (target.row - this.row > 0 ? 1 : -1),
      target.column + (target.column - this.column > 0 ? 1 : -1)
    )
  }

  public toString() {
    return 'abcdefgh'.charAt(this.column) + (8 - this.row).toString()
  }
}
