// simplified vector model (diagonals only)
export class Vector {
  public static NW = new Vector(-1, -1)
  public static NE = new Vector(-1, 1)
  public static SE = new Vector(1, 1)
  public static SW = new Vector(1, -1)

  public static get(fromSquare: number, toSquare: number): Vector {
    const fromRow = fromSquare >> 3
    const fromColumn = fromSquare - (fromRow << 3)
    const toRow = toSquare >> 3
    const toColumn = toSquare - (toRow << 3)
    return new Vector(
      toRow - fromRow,
      toColumn - fromColumn
    )
  }

  private constructor(
    private deltaRow: number,
    private deltaColumn: number
  ) { }

  public get isUnit(): boolean {
    return Math.abs(this.deltaRow) === 1 && Math.abs(this.deltaColumn) === 1
  }

  public get isDiagonal(): boolean {
    return Math.abs(this.deltaRow) === Math.abs(this.deltaColumn)
  }

  public get isUp(): boolean {
    return this.deltaRow < 0
  }

  public get step(): Vector {
    return new Vector(
      (this.deltaRow > 0) ? 1 : -1,
      (this.deltaColumn > 0) ? 1 : -1
    )
  }

  public next(square: number): number | null {
    const row = square >> 3
    const column = square - (row << 3)
    const nextRow = row + this.deltaRow
    if (row < 0 || row > 7) return null
    const nextColumn = column + this.deltaColumn
    if (column < 0 || column > 7) return null
    return (nextRow << 3) + nextColumn
  }
}
