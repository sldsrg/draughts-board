import { Piece } from './piece'
import { Field } from './field'

export class Position {
  public static INITIAL = 'mmmm/mmmm/mmmm/4/4/MMMM/MMMM/MMMM w'

  public static fromStart(): Position {
    return Position.decode(Position.INITIAL)
  }

  public static fromString(s: string): Position {
    /// examples:
    /// whites = 'b3 c3', blacks='king g1 mans h6 g5'
    /// whites = 'дамки е1 h2 простая g3', blacks = 'дамка g1 простые f2 h4'
    const gre = /((whites:)?\s*((\s*[a-h][1-8])+)),\s*((blacks:)?\s*((\s*[a-h][1-8])+))\s*(b)?/gi
    const res = gre.exec(s)
    if (res === null) throw new Error(`Incorrect position description: ${s}`)
    const whites = res[3]
    const blacks = res[7]
    const position = new Position()
    let key = 0
    whites.split(' ').forEach(sq => {
      const pos = Field.fromString(sq)
      const piece = new Piece(true, key++, pos)
      position.pieces.push(piece)
      position.squares[pos.row][pos.column] = piece
    })
    blacks.split(' ').forEach(sq => {
      const pos = Field.fromString(sq)
      const piece = new Piece(false, key++, pos)
      position.pieces.push(piece)
      position.squares[pos.row][pos.column] = piece
    })
    position.whitesTurn = res[9] === undefined
    return position
  }

  public static decode(encoded: string): Position {
    const position = new Position()
    let key = 0
    const l = encoded.length
    let row = 0
    let column = 1
    let i
    for (i = 0; i < l && row < 8 && column < 8; i++) {
      const ch = encoded[i]
      if (ch === ' ') continue
      if (/\d/.test(ch)) {
        column += Number.parseInt(ch, 10) << 1
      } else if (ch === '/') {
        if (row % 2 === 1 && column === 0) continue
        if (row % 2 === 0 && column === 1) continue
        console.log(`Invalid code at position ${i} (char ${ch}) row ${row}, col ${column}`)
        throw new Error('Invalid notation')
      } else {
        const piece = new Piece(ch === 'M', key++, { row, column })
        position.pieces.push(piece)
        position.squares[row][column] = piece
        column += 2
      }

      if (column === 9) {
        column = 0
        row++
      } else if (row % 2 === 1 && column === 8) {
        column = 1
        row++
      }
    }

    const parts = encoded
      .slice(i)
      .trim()
      .split(' ')
    if (parts.length > 0) {
      position.whitesTurn = parts[0] === 'w'
    } else position.whitesTurn = true

    return position
  }

  public pieces: Piece[]
  public squares: Array<Array<Piece | undefined>>
  public whitesTurn: boolean

  private constructor() {
    this.whitesTurn = true
    this.pieces = new Array<Piece>()
    this.squares = new Array(8).fill(null).map(_ => new Array(8))
  }

  public at(pos: Field) {
    return this.squares[pos.row][pos.column]
  }

  public toString(): string {
    const whites = this.pieces
      .filter(p => p.isWhite)
      .map(p => p.pos.toString())
      .sort()
    const blacks = this.pieces
      .filter(p => !p.isWhite)
      .map(p => p.pos.toString())
      .sort()
    const res = `Whites: ${whites.join(' ')}, Blacks: ${blacks.join(' ')}`
    if (this.whitesTurn) return res
    else return res + ' blacks turn'
  }

  /// assumed that preliminary checks completed
  public canCapture(actor: Piece, to: Field): Piece | null {
    return null
  }

  public canMove(from: Field, to?: Field): boolean {
    const piece = this.squares[from.row][from.column]
    if (!piece) return false
    if (piece.isWhite !== this.whitesTurn) return false
    if (to && this.squares[to.row][to.column]) return false
    // check on capture
    if (to && Math.abs(from.row - to.row) === 2 && Math.abs(from.column - to.column) === 2) {
      const row = (from.row + to.row) >> 1
      const column = (from.column + to.column) >> 1
      const captured = this.squares[row][column]
      if (!captured) return false
      if (captured.isWhite === piece.isWhite) return false
      else return true
    }
    // check on quiet move
    if (piece.isWhite) {
      if (to) {
        if (from.row - to.row !== 1) return false
        if (Math.abs(from.column - to.column) !== 1) return false
      }
    } else {
      if (to) {
        if (to.row - from.row !== 1) return false
        if (Math.abs(from.column - to.column) !== 1) return false
      }
    }

    return true
  }

  /// returns true if completed, otherwise continuation required
  public makeMove(from: Field, to: Field): boolean {
    if (!this.canMove(from, to)) return false
    const piece = this.at(from) as Piece
    this.squares[from.row][from.column] = undefined
    piece.pos = { ...to }
    this.squares[to.row][to.column] = piece

    // check on captured pieces
    const step = { row: to.row > from.row ? 1 : -1, column: to.column > from.column ? 1 : -1 }
    const next = new Field(from.row + step.row, from.column + step.column)
    if (next.row !== to.row) {
      const captured = this.at(next) as Piece
      this.pieces = this.pieces.filter(p => p.key !== captured.key)
      this.squares[next.row][next.column] = undefined
    }

    // check on capture continuation
    this.whitesTurn = !this.whitesTurn
    return true
  }

  public encode(): string {
    const res: string[] = []
    for (let i = 0; i < 8; i++) {
      const row = this.squares[i]
      let n = 0 // number of contiguous empty squares
      for (let j = 0; j < 8; j++) {
        // process only dark squares
        if (i % 2 === j % 2) continue
        const square = row[j]
        if (square === undefined) n++
        else {
          if (n > 0) {
            res.push(n.toString())
            n = 0
          }
          res.push(square.isWhite ? 'M' : 'm')
        }
      }
      if (n > 0) res.push(n.toString())
      res.push('/')
    }
    res.pop() // remove last slash

    res.push(this.whitesTurn ? ' w' : ' b')
    return res.join('')
  }
}
