import { Piece } from './piece'
import { Field } from './field'
import { Vector } from './vector'

export class Position {
  public static INITIAL = 'mmmm/mmmm/mmmm/4/4/MMMM/MMMM/MMMM w'

  public static fromStart(): Position {
    return Position.decode(Position.INITIAL)
  }

  public static fromString(s: string): Position {
    /// examples:
    /// whites: b3 c3, blacks: king g1 mans h6 g5'
    /// белые: дамки е1 h2 простая g3, черные: дамка g1 простые f2 h4'

    const gre = new RegExp([
      /((whites:)?\s*(kings?\s*(?<wk>(\s*[a-h][1-8])+))?\s*((mans?)?\s*(?<wm>(\s*[a-h][1-8])+))?)/,
      /,\s*/,
      /((blacks:)?\s*(kings?\s*(?<bk>(\s*[a-h][1-8])+))?\s*((mans?)?\s*(?<bm>(\s*[a-h][1-8])+))?)/,
      /\s*(?<turn>b)?/
    ].map(r => r.source).join(''), 'gi')

    const res = gre.exec(s)
    if (res === null || !res.groups) throw new Error(`Incorrect position description: ${s}`)
    const position = new Position()
    let key = 0
    Object.entries(res.groups).forEach(([name, group]) => {
      if (!group) return
      if (name === 'turn') {
        position.whitesTurn = !group
      } else {
        const isWhite = name === 'wk' || name === 'wm'
        const isKing = name === 'wk' || name === 'bk'
        group.trim().split(' ').forEach(sq => {
          const pos = Field.fromString(sq)
          const piece = new Piece(isWhite, key++, pos, isKing)
          position.pieces.push(piece)
          position.squares[pos.row][pos.column] = piece
        })
      }
    })
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
        const piece = new Piece(ch === 'M', key++, new Field(row, column))
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

  public isMoveLegal(from: Field, to: Field): boolean {
    const piece = this.at(from)
    if (!piece) return false
    if (piece.isWhite !== this.whitesTurn) return false // not your turn
    if (!piece.canMove(this, to)) return false

    if (this.findCapture(from, to) !== null) {
      return true
    } else {
      // checking for obligatory capture
      const captureCapable = this.pieces.filter(p =>
        p.isWhite === piece.isWhite
        && p.canCapture(this))
      if (captureCapable.length > 0) return false
    }
    return true
  }

  /// returns true if completed, otherwise continuation required
  public makeMove(from: Field, to: Field): boolean {
    if (!this.isMoveLegal(from, to)) return false

    // check on captured pieces
    const captured = this.findCapture(from, to)
    if (captured) {
      this.squares[captured.pos.row][captured.pos.column] = undefined
      this.pieces = this.pieces.filter(p => p.key !== captured.key)
    }

    const piece = this.at(from) as Piece
    this.squares[from.row][from.column] = undefined
    piece.pos = to
    this.squares[to.row][to.column] = piece
    if (piece.isWhite && to.row === 0 || !piece.isWhite && to.row === 7) {
      piece.isKing = true
    }

    // check on capture continuation
    if (captured && piece.canCapture(this)) return false

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

  private findCapture(from: Field, to: Field): Piece | null {
    const vector = Vector.get(from, to)
    if (vector.isUnit) return null
    const step = vector.step
    let next = from.shift(step)
    if (!next) return null
    let captured = this.at(next)
    next = next.shift(step)
    while (next) {
      if (captured) {
        if (captured.isWhite === this.whitesTurn) return null
        if (this.at(next)) return null
        return captured
      }
      if (next.row === to.row) return null
      captured = this.at(next)
      next = next.shift(step)
    }
    return null
  }
}
