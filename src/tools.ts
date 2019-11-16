import { IState, Action } from './reducer'
import { Vector } from './vector'
import { Field } from './field'

export function newGame(): IState {
  let key = 0
  const pieces = 'mmmmmmmmmmmmMMMMMMMMMMMM'.split('')
  const board = Array(64).fill(null).map((v, i) => {
    const row = i >> 3
    const column = i - (row << 3)
    if (row % 2 !== column % 2 && row !== 3 && row !== 4) return key++
    return v
  })
  return { board, pieces, whitesTurn: true, belongsToMoveNumber: 1 }
}

export function setUp(s: string): IState {
  /// examples:
  /// whites: b3 c3, blacks: king g1 mans h6 g5'
  /// белые: дамки е1 h2 простая g3, черные: дамка g1 простые f2 h4'

  const gre = new RegExp([
    /(?:(?:whites:)?\s*(?:kings?\s*((?:\s*[a-h][1-8])+))?\s*(?:(?:mans?)?\s*((?:\s*[a-h][1-8])+))?)/,
    /,\s*/,
    /(?:(?:blacks:)?\s*(?:kings?\s*((?:\s*[a-h][1-8])+))?\s*(?:(?:mans?)?\s*((?:\s*[a-h][1-8])+))?)/,
    /\s*(b)?/
  ].map(r => r.source).join(''), 'gi')

  const res = gre.exec(s)
  if (!res) throw new Error(`Incorrect position description: ${s}`)
  const board = Array(64).fill(null)
  const pieces: string[] = []
  let key = 0
  for (let i = 1; i < 5; i++) {
    if (!res[i]) continue
    const isWhite = i < 3
    const isKing = i % 2 === 1
    res[i].trim().split(' ').forEach(sq => {
      const square = Field.parse(sq)
      const piece = (isKing ? 'k' : 'm')
      pieces.push(isWhite ? piece.toUpperCase() : piece)
      board[square] = key++
    })
  }
  const whitesTurn = !res[5]
  return { pieces, board, whitesTurn, belongsToMoveNumber: 1 }
}

export function snapshot(state: IState): string {
  const whites = state.pieces
    .map((p, i) => {
      if (p === null || 'mk'.includes(p)) return null
      const field = Field.fromIndex(state.board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()
  const blacks = state.pieces
    .map((p, i) => {
      if (p === null || 'MK'.includes(p)) return null
      const field = Field.fromIndex(state.board.findIndex(s => s === i))
      return field.toString()
    })
    .filter(p => p !== null)
    .sort()
  const res = `Whites: ${whites.join(' ')}, Blacks: ${blacks.join(' ')}`
  if (state.whitesTurn) return res
  else return res + ' blacks turn'
}

/**
 * Parse move and return array of actions
 * If move is illegal return null
 *
 * @param state - current state
 * @param to  - target square number
 */
export function parseMove(state: IState, to: number): null | Action[] {
  if (state.selection === undefined) return null
  const pieceIndex = state.board[state.selection]
  if (pieceIndex === null) return null
  const pieceCode = state.pieces[pieceIndex]
  const isWhite = 'MK'.includes(pieceCode)
  if (isWhite !== state.whitesTurn) return null // not your turn
  if (state.board[to] !== null) return null // target square is occupied

  const vector = Vector.get(state.selection, to)
  if (!vector.isDiagonal) return null
  const step = vector.step
  const actions: Action[] = []

  if ('Mm'.includes(pieceCode)) { // it’s a man’s move
    if (vector.isUnit) { // quiet move
      if (isWhite === to - state.selection > 0) return null // forwards only
    } else { // capture
      const next = step.next(state.selection)
      if (next === null) return null
      const trough = state.board[next]
      if (trough === null) return null
      if (state.whitesTurn === 'MK'.includes(state.pieces[trough])) return null
      actions.push({ type: 'remove', from: next })
    }
  } else { // it’s a king’s move
    // scanning path
    let quiet = true
    for (let sq = step.next(state.selection); sq !== null && sq !== to; sq = step.next(sq)) {
      const id = state.board[sq]
      if (id === null) continue
      const code = state.pieces[id]
      if ('MK'.includes(code) === state.whitesTurn) return null
      if (!quiet) return null
      quiet = false
      actions.push({ type: 'remove', from: sq })
    }
  }

  // with empty actions move is quiet
  // checking for obligatory capture
  if (actions.length === 0) {
    const captureCapable = state.pieces.filter((p, id) => {
      if ('KM'.includes(p) !== isWhite) return false
      const square = state.board.findIndex(i => i === id)
      return shouldCapture(state.board, state.pieces, square)
    })
    if (captureCapable.length > 0) return null
  }
  actions.unshift({ type: 'move', from: state.selection, to })
  return actions
}

/**
 * shouldCapture
 *
 * return true if piece at given square can capture some piece
 */
export function shouldCapture(board: Array<number | null>, pieces: string[], square: number): boolean {
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
function canCaptureOn(board: Array<number | null>, pieces: string[], from: number, vector: Vector): boolean {
  const id = board[from]
  if (id === null) return false
  const code = pieces[id]
  const isWhite = 'MK'.includes(code)
  const isMan = 'Mm'.includes(code)
  const step = vector.step
  let square = step.next(from)
  if (square === null) return false
  let captured = board[square]
  square = step.next(square)
  while (square !== null) {
    if (captured !== null) {
      if (isWhite === 'MK'.includes(pieces[captured])) return false
      if (board[square] !== null) return false
      return true
    }
    if (isMan) return false
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
export function hasAnyMove(board: Array<number | null>, pieces: string[], square: number): boolean {
  if (hasMoveOn(board, pieces, square, Vector.NE)) return true
  if (hasMoveOn(board, pieces, square, Vector.NW)) return true
  if (hasMoveOn(board, pieces, square, Vector.SE)) return true
  if (hasMoveOn(board, pieces, square, Vector.SW)) return true
  return false
}

function hasMoveOn(board: Array<number | null>, pieces: string[], from: number, vector: Vector): boolean {
  if (canCaptureOn(board, pieces, from, vector)) return true
  const id = board[from] as number
  const code = pieces[id]
  const isWhite = 'MK'.includes(code)
  if ('Mm'.includes(code)) {
    if (isWhite !== vector.isUp) return false
  }
  const step = vector.step
  const sq = step.next(from)
  return sq !== null && board[sq] === null
}
