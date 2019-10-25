import { Piece } from './piece'

export class Position {
  public static INITIAL = [
    [, 'm', , 'm', , 'm', , 'm'],
    ['m', , 'm', , 'm', , 'm'],
    [, 'm', , 'm', , 'm', , 'm'],
    [],
    [],
    ['M', , 'M', , 'M', , 'M'],
    [, 'M', , 'M', , 'M', , 'M'],
    ['M', , 'M', , 'M', , 'M']
  ]

  public pieces: Piece[]

  constructor(squares: Array<Array<string | undefined>>) {
    let key = 0
    this.pieces = new Array<Piece>()
    squares.forEach((ss: Array<string | undefined>, row) =>
      ss.forEach((s, column) => {
        if (s === 'M') this.pieces.push(new Piece(true, key++, row, column))
        if (s === 'm') this.pieces.push(new Piece(false, key++, row, column))
      })
    )
  }
}
