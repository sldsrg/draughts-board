import { Position } from './position'
import { Field } from './field'

export interface IState {
  selection: Field | null
  position: Position
}

interface IAction {
  type: 'init' | 'click'
  payload?: object
}

export const INITIAL_STATE: IState = {
  selection: null,
  position: Position.fromStart()
}

export function reducer(state: IState, action: IAction): IState {
  switch (action.type) {
    case 'init':
      if (action.payload) {
        return state
      } else {
        return { selection: null, position: Position.fromStart() }
      }
    case 'click':
      const { row, column } = action.payload as Field
      const piece = state.position.squares[row][column]
      if (piece && state.position.whitesTurn === piece.isWhite) {
        return { ...state, selection: new Field(row, column) }
      }
      if (state.selection && state.position.makeMove(state.selection, new Field(row, column))) {
        return { ...state, selection: null }
      }
      return { ...state }
    default:
      throw new Error('INVALID ACTION TYPE')
  }
}
