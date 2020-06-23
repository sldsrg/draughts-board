import { shouldCapture } from './tools'
import { Field } from './field'

export type Inventory = Array<'m' | 'k' | 'M' | 'K' | null>

export interface State {
  // position related state
  board: Array<number | null>,
  pieces: Inventory,
  // interaction related state
  stage: 'idle' | 'initiation' | 'capture' | 'pending',
  notation: string
}

export type Action =
  // position related actions
  // { type: 'init', position?: string } |
  {
    type: 'restore', with: {
      board: Array<number | null>,
      pieces: Inventory
    }
  } |
  { type: 'move', from: number, to: number } |
  { type: 'remove', from: number } |
  { type: 'place', to: number, code: 'm' | 'k' | 'M' | 'K' | null } |
  // interaction related actions
  { type: 'select', square: number } |
  { type: 'hoop', square: number } |
  { type: 'chop', square: number } |
  { type: 'reset' }

export const INITIAL_STATE: State = {
  board: Array(64).fill(null),
  pieces: Array(64).fill(null),
  stage: 'idle',
  notation: ''
}

export function reducer(state: State, action: Action): State {
  const { board, pieces, stage, notation } = state
  switch (action.type) {
    case 'restore':
      return {
        board: [...action.with.board],
        pieces: [...action.with.pieces],
        stage,
        notation
      }
    case 'move': {
      const nextBoard = [
        ...board.slice(0, action.to),
        board[action.from],
        ...board.slice(action.to + 1)
      ]
      nextBoard[action.from] = null
      // check on man-to-king promotion
      const id = nextBoard[action.to] as number
      if (pieces[id] === 'M' && action.to < 8) {
        const nextPieces: Inventory = [
          ...pieces.slice(0, id),
          'K',
          ...pieces.slice(id + 1)
        ]
        return { board: nextBoard, pieces: nextPieces, stage, notation }
      }
      if (pieces[id] === 'm' && action.to > 55) {
        const nextPieces: Inventory = [
          ...pieces.slice(0, id),
          'k',
          ...pieces.slice(id + 1)
        ]
        return { board: nextBoard, pieces: nextPieces, stage, notation }
      }
      return { board: nextBoard, pieces, stage, notation }
    }
    case 'remove': {
      const id = board[action.from] as number
      return {
        board: [
          ...board.slice(0, action.from),
          null,
          ...board.slice(action.from + 1)
        ],
        pieces: [
          ...pieces.slice(0, id),
          null,
          ...pieces.slice(id + 1)
        ],
        stage,
        notation
      }
    }
    case 'place': {
      if (board[action.to] === null) {
        if (pieces[action.to] !== null)
          throw 'Action "place" not allowed after any piece move.'
      }
      else {
        if (board[action.to] !== action.to)
          throw 'Action "place" not allowed after any piece move.'
        if (pieces[action.to] === action.code) {
          // clear if code matches
          return {
            board: [
              ...board.slice(0, action.to),
              null,
              ...board.slice(action.to + 1)
            ],
            pieces: [
              ...pieces.slice(0, action.to),
              null,
              ...pieces.slice(action.to + 1)
            ],
            stage,
            notation
          }
        }
      }
      return {
        board: [
          ...board.slice(0, action.to),
          action.to,
          ...board.slice(action.to + 1)
        ],
        pieces: [
          ...pieces.slice(0, action.to),
          action.code,
          ...pieces.slice(action.to + 1)
        ],
        stage,
        notation
      }
    }
    case 'select':
      return {
        board,
        pieces,
        stage: 'initiation',
        notation: Field.fromIndex(action.square).toString()
      }
    case 'hoop':
      if (state.stage === 'initiation') {
        return {
          board,
          pieces,
          stage: 'pending',
          notation: `${notation}-${Field.fromIndex(action.square).toString()}`
        }
      } else {
        throw new Error('Illegal state on action "hoop"')
      }
    case 'chop':
      if (['initiation', 'capture'].includes(state.stage)) {
        return {
          board,
          pieces,
          stage: shouldCapture(board, pieces, action.square) ? 'capture' : 'pending',
          notation: `${notation}:${Field.fromIndex(action.square).toString()}`
        }
      } else {
        throw new Error('Illegal state on action "chop"')
      }
    case 'reset':
      return {
        board,
        pieces,
        stage: 'idle',
        notation: ''
      }
  }
}
