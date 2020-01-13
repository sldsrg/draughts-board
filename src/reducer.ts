import {shouldCapture} from './tools'
import {Field} from './field'

export interface State {
  // position related state
  board: Array<number | null>,
  pieces: string[],
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
      pieces: string[]
    }
  } |
  {type: 'move', from: number, to: number} |
  {type: 'remove', from: number} |
  // interaction related actions
  {type: 'select', square: number} |
  {type: 'hoop', square: number} |
  {type: 'chop', square: number} |
  {type: 'reset'}

export const INITIAL_STATE: State = {
  pieces: [],
  board: Array(64).fill(null),
  stage: 'idle',
  notation: ''
}

export function reducer(state: State, action: Action): State {
  let {board, pieces, stage, notation} = state
  switch (action.type) {
    case 'restore':
      ({board, pieces} = action.with)
      break
    case 'move':
      {
        board[action.to] = board[action.from]
        board[action.from] = null
        // check on man-to-king promotion
        const id = board[action.to] as number
        if (pieces[id] === 'M' && action.to < 8) pieces[id] = 'K'
        if (pieces[id] === 'm' && action.to > 54) pieces[id] = 'k'
      }
      break
    case 'remove':
      pieces[board[action.from] as number] = ''
      board[action.from] = null
      break
    case 'select':
      stage = 'initiation'
      notation = Field.fromIndex(action.square).toString()
      break
    case 'hoop':
      if (state.stage === 'initiation') {
        const target = Field.fromIndex(action.square).toString()
        stage = 'pending'
        notation = `${state.notation}-${target}`
      } else {
        throw new Error('Illegal state on action "hoop"')
      }
      break
    case 'chop':
      if (['initiation', 'capture'].includes(state.stage)) {
        const target = Field.fromIndex(action.square).toString()
        notation = `${state.notation}:${target}`
        stage = shouldCapture(board, pieces, action.square) ? 'capture' : 'pending'
      } else {
        throw new Error('Illegal state on action "chop"')
      }
      break
    case 'reset':
      stage = 'idle'
      notation = ''
      break
  }
  return {
    board: [...board],
    pieces: [...pieces],
    stage, notation
  }
}
