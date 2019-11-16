import { newGame, setUp, shouldCapture } from './tools'

export interface IState {
  board: Array<number | null>,
  pieces: string[],
  whitesTurn: boolean,
  captureInProgress?: boolean,
  belongsToMoveNumber?: number,
  selection?: number,
}

export type Action =
  { type: 'init', position?: string } |
  { type: 'select', at: number } |
  { type: 'move', from: number, to: number } |
  { type: 'remove', from: number } |
  { type: 'convert', at: number } |
  { type: 'restore', with: IState } |
  { type: 'advance' }

export const INITIAL_STATE: IState = {
  pieces: [],
  board: Array(64).fill(null),
  whitesTurn: true
}

export function reducer(state: IState, action: Action): IState {
  switch (action.type) {
    case 'init':
      if (action.position === undefined) {
        return newGame()
      } else {
        return setUp(action.position as string)
      }
    case 'select':
      if (action.at === undefined) {
        throw new Error('Payload required for action "select"')
      }
      return { ...state, selection: action.at }
    case 'move':
      state.board[action.to] = state.board[action.from]
      state.board[action.from] = null
      return { ...state, board: [...state.board], selection: action.to }
    case 'remove':
      state.pieces[state.board[action.from] as number] = ''
      state.board[action.from] = null
      state.captureInProgress = true
      return { ...state, board: [...state.board], pieces: [...state.pieces] }
    case 'convert':
      const id = state.board[action.at] as number
      const pieces = [...state.pieces]
      pieces[id] = 'KkMm'.substr('MmKk'.indexOf(state.pieces[id]), 1)
      return { ...state, pieces }
    case 'restore':
      return { ...action.with }
    case 'advance':
      if (state.captureInProgress && state.selection !== null
        && shouldCapture(state.board, state.pieces, state.selection as number)) return { ...state }
      let belongsToMoveNumber = state.belongsToMoveNumber || 1
      belongsToMoveNumber++
      const whitesTurn = !state.whitesTurn
      const selection = undefined
      const captureInProgress = undefined
      return { ...state, whitesTurn, belongsToMoveNumber, selection, captureInProgress }
  }
}
