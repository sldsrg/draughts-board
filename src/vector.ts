import { Field } from './field'

// simplified vector model (diagonal only)
export class Vector {
  public static unit(from: Field, to: Field): Vector {
    return new Vector(
      (to.row > from.row) ? 1 : -1,
      (to.column > from.column) ? 1 : -1
    )
  }

  public static get(from: Field, to: Field): Vector {
    return new Vector(
      to.row - from.row,
      to.column - from.column
    )
  }

  constructor(public deltaRow: number, public deltaColumn: number) { }

  public get isUnit(): boolean {
    return Math.abs(this.deltaRow) === 1 && Math.abs(this.deltaColumn) === 1
  }

  public get step(): Vector {
    return new Vector(
      (this.deltaRow > 0) ? 1 : -1,
      (this.deltaColumn > 0) ? 1 : -1
    )
  }
}
