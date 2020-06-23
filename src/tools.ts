import { Action, Inventory } from './reducer'
import { Vector } from './vector'
import { Field } from './field'

export const isWhite = (code: 'm' | 'k' | 'M' | 'K' | null) => code === 'M' || code === 'K'
export const isMan = (code: 'm' | 'k' | 'M' | 'K' | null) => code === 'M' || code === 'm'

export function newGame(): {
  board: Array<number | null>,
  pieces: Inventory,
  whitesTurn: boolean
} {
  const pieces: Inventory = Array(64).fill(null)
  const board = Array(64).fill(null)
  for (let i = 0; i < 64; i++) {
    const row = i >> 3
    const column = i - (row << 3)
    if (row % 2 !== column % 2 && row !== 3 && row !== 4) {
      board[i] = i
      pieces[i] = row > 4 ? 'M' : 'm'
    }
  }
  return { board, pieces, whitesTurn: true }
}

export function setUp(s: string): {
  board: Array<number | null>,
  pieces: Inventory,
  whitesTurn: boolean
} {
  /// examples:
  /// whites: b3 c3, blacks: king g1 mans h6 g5'
  /// белые: дамки е1 h2 простая g3, черные: дамка g1 простые f2 h4'

  const gre = new RegExp([
    // eslint-disable-next-line max-len
    /(?:(?:whites:)?\s*(?:kings?\s*((?:\s*[a-h][1-8])+))?\s*(?:(?:mans?)?\s*((?:\s*[a-h][1-8])+))?)/,
    /,\s*/,
    // eslint-disable-next-line max-len
    /(?:(?:blacks:)?\s*(?:kings?\s*((?:\s*[a-h][1-8])+))?\s*(?:(?:mans?)?\s*((?:\s*[a-h][1-8])+))?)/,
    /\s*(b)?/
  ].map(r => r.source).join(''), 'gi')

  const res = gre.exec(s)
  if (!res) throw new Error(`Incorrect position description: ${s}`)
  const board = Array(64).fill(null)
  const pieces: Inventory = Array(64).fill(null)
  for (let i = 1; i < 5; i++) {
    if (!res[i]) continue

    res[i].trim().split(' ').forEach(sq => {
      const square = Field.parse(sq)
      board[square] = square
      if (i < 3) {
        pieces[square] = i % 2 === 1 ? 'K' : 'M'
      } else {
        pieces[square] = i % 2 === 1 ? 'k' : 'm'
      }
    })
  }
  const whitesTurn = !res[5]
  return { board, pieces, whitesTurn }
}

export function snapshot(
  board: Array<number | null>,
  pieces: Inventory,
  whitesTurn: boolean): string {
  const whiteKings = pieces
    .map((p, i) => {
      if (p !== 'K') return null
      const field = Field.fromIndex(board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()
  const whiteMans = pieces
    .map((p, i) => {
      if (p !== 'M') return null
      const field = Field.fromIndex(board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()
  const blackKings = pieces
    .map((p, i) => {
      if (p !== 'k') return null
      const field = Field.fromIndex(board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()
  const blackMans = pieces
    .map((p, i) => {
      if (p !== 'm') return null
      const field = Field.fromIndex(board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()

  const whites: Array<string> = []
  if (whiteKings.length > 1) whites.push(`kings ${whiteKings.join(' ')}`)
  else if (whiteKings.length === 1) whites.push(`king ${whiteKings[0]}`)
  // omit word 'mans' if no kings
  if (whiteKings.length === 0) whites.push(whiteMans.join(' '))
  else if (whiteMans.length > 1) whites.push(`mans ${whiteMans.join(' ')}`)
  else if (whiteMans.length === 1) whites.push(`man ${whiteMans[0]}`)

  const blacks: Array<string> = []
  if (blackKings.length > 1) blacks.push(`kings ${blackKings.join(' ')}`)
  else if (blackKings.length === 1) blacks.push(`king ${blackKings[0]}`)
  // omit word 'mans' if no kings
  if (blackKings.length === 0) blacks.push(blackMans.join(' '))
  else if (blackMans.length > 1) blacks.push(`mans ${blackMans.join(' ')}`)
  else if (blackMans.length === 1) blacks.push(`man ${blackMans[0]}`)

  const res = `Whites: ${whites.join(' ')}, Blacks: ${blacks.join(' ')}`
  if (whitesTurn) return res
  else return res + ' blacks turn'
}

/**
 * Parse move and return array of actions
 * If move is illegal return null
 *
 * @param state - current state
 * @param to  - target square number
 */
export function parseMove(
  board: Array<number | null>,
  pieces: Inventory,
  from: number, to: number): null | Action[] {
  const piece = board[from]
  if (piece === null) return null
  const pieceCode = pieces[piece]
  if (board[to] !== null) return null // target square is occupied

  const vector = Vector.get(from, to)
  if (!vector.isDiagonal) return null
  const step = vector.step
  const actions: Action[] = []

  if (isMan(pieceCode)) { // it’s a man’s move
    if (vector.isUnit) { // quiet move
      if (isWhite(pieceCode) === (to - from > 0)) return null // forwards only
    } else { // capture
      const next = step.next(from)
      if (next === null) return null
      const trough = board[next]
      if (trough === null) return null
      if (isWhite(pieceCode) === isWhite(pieces[trough])) return null
      actions.push({ type: 'remove', from: next })
    }
  } else { // it’s a king’s move
    // scanning path
    let quiet = true
    for (let sq = step.next(from); sq !== null && sq !== to; sq = step.next(sq)) {
      const id = board[sq]
      if (id === null) continue
      const code = pieces[id]
      if (isWhite(code) === isWhite(pieceCode)) return null
      if (!quiet) return null
      quiet = false
      actions.push({ type: 'remove', from: sq })
    }
  }

  // with empty actions move is quiet
  // checking for obligatory capture
  if (actions.length === 0) {
    const captureCapable = pieces.filter((p, id) => {
      if (isWhite(p) !== isWhite(pieceCode)) return false
      const square = board.findIndex(i => i === id)
      return shouldCapture(board, pieces, square)
    })
    if (captureCapable.length > 0) return null
  }
  actions.unshift({ type: 'move', from, to })
  return actions
}

/**
 * shouldCapture
 *
 * return true if piece at given square can capture some piece
 */
export function shouldCapture(
  board: Array<number | null>, pieces: Inventory, square: number
): boolean {
  if (canCaptureOn(board, pieces, square, Vector.NE)) return true
  if (canCaptureOn(board, pieces, square, Vector.NW)) return true
  if (canCaptureOn(board, pieces, square, Vector.SE)) return true
  if (canCaptureOn(board, pieces, square, Vector.SW)) return true
  return false
}

/**
 * canCaptureOn
 *
 * return true if this piece can capture on given direction
 */
function canCaptureOn(
  board: Array<number | null>, pieces: Inventory, from: number, vector: Vector
): boolean {
  const id = board[from]
  if (id === null) return false
  const code = pieces[id]

  const step = vector.step
  let square = step.next(from)
  if (square === null) return false
  let captured = board[square]
  square = step.next(square)
  while (square !== null) {
    if (captured !== null) {
      if (isWhite(code) === isWhite(pieces[captured])) return false
      if (board[square] !== null) return false
      return true
    }
    if (isMan(code)) return false
    captured = board[square]
    square = step.next(square)
  }
  return false
}

/**
 * hasAnyMove
 *
 * return true if piece at given square can make any move
 */
export function hasAnyMove(
  board: Array<number | null>,
  pieces: Inventory,
  square: number
): boolean {
  if (hasMoveOn(board, pieces, square, Vector.NE)) return true
  if (hasMoveOn(board, pieces, square, Vector.NW)) return true
  if (hasMoveOn(board, pieces, square, Vector.SE)) return true
  if (hasMoveOn(board, pieces, square, Vector.SW)) return true
  return false
}

function hasMoveOn(
  board: Array<number | null>, pieces: Inventory, from: number, vector: Vector
): boolean {
  if (canCaptureOn(board, pieces, from, vector)) return true
  const id = board[from] as number
  const code = pieces[id]
  if (isMan(code)) {
    if (isWhite(code) !== vector.isUp) return false
  }
  const step = vector.step
  const sq = step.next(from)
  return sq !== null && board[sq] === null
}
