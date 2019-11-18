import {newGame, setUp, shouldCapture} from './tools'

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

export function getReducer(callback?: (to: number, capture: boolean, completed: boolean) => void) {
  return (state: IState, action: Action): IState => {
    let {board, pieces, selection, whitesTurn, belongsToMoveNumber, captureInProgress} = state
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
        selection = action.at
        break
      case 'move':
        board[action.to] = board[action.from]
        board[action.from] = null
        selection = action.to
        break
      case 'remove':
        pieces[board[action.from] as number] = ''
        board[action.from] = null
        captureInProgress = true
        break
      case 'convert':
        const id = board[action.at] as number
        pieces[id] = 'KkMm'.substr('MmKk'.indexOf(pieces[id]), 1)
        break
      case 'restore':
        ({
            board,
            pieces,
            selection,
            whitesTurn,
            belongsToMoveNumber,
            captureInProgress
          } = action.with
        )
        break
      case 'advance':
        if (captureInProgress && selection !== null) {
          captureInProgress = shouldCapture(board, pieces, selection as number)
        }
        if (callback) {
          callback(selection as number, state.captureInProgress === true,
            !captureInProgress)
        }
        if (captureInProgress) break
        belongsToMoveNumber = (state.belongsToMoveNumber || 1) + 1
        whitesTurn = !state.whitesTurn
        selection = undefined
        captureInProgress = undefined
        break
    }
    return {
      board: [...board],
      pieces: [...pieces],
      whitesTurn, captureInProgress, belongsToMoveNumber, selection
    }

  }
}
