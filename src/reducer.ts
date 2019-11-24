import {newGame, setUp, shouldCapture} from './tools'
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
  {type: 'init', position?: string} |
  {type: 'move', from: number, to: number} |
  {type: 'remove', from: number} |
  {type: 'convert', at: number} |
  {
    type: 'restore', with: {
      board: Array<number | null>,
      pieces: string[]
    }
  } |
  // interaction related actions
  {type: 'select', sqaure: number} |
  {type: 'hoop', sqaure: number} |
  {type: 'chop', sqaure: number} |
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
    case 'init': // TODO: replace with setup action (position only)
      if (action.position === undefined) {
        return {...INITIAL_STATE, ...newGame()}
      } else {
        return {...INITIAL_STATE, ...setUp(action.position as string)}
      }
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
    case 'restore': // TODO: merge with setup action
      ({board, pieces} = action.with)
      break
    case 'select':
      stage = 'initiation'
      notation = Field.fromIndex(action.sqaure).toString()
      break
    case 'hoop':
      if (state.stage === 'initiation') {
        const target = Field.fromIndex(action.sqaure).toString()
        stage = 'pending'
        notation = `${state.notation}-${target}`
      } else {
        throw new Error('Illegal state on action "hoop"')
      }
      break
    case 'chop':
      if (['initiation', 'capture'].includes(state.stage)) {
        const target = Field.fromIndex(action.sqaure).toString()
        notation = `${state.notation}:${target}`
        stage = shouldCapture(board, pieces, action.sqaure) ? 'capture' : 'pending'
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
