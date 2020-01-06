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
  {type: 'convert', at: number} |
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
      board[action.to] = board[action.from]
      board[action.from] = null
      break
    case 'remove':
      pieces[board[action.from] as number] = ''
      board[action.from] = null
      break
    case 'convert':
      {
        const id = board[action.at] as number
        pieces[id] = 'KkMm'.substr('MmKk'.indexOf(pieces[id]), 1)
      }
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
