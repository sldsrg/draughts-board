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
      const field = action.payload as Field
      const piece = state.position.at(field)
      if (piece && state.position.whitesTurn === piece.isWhite) {
        return { ...state, selection: field }
      }
      if (state.selection && state.position.isMoveLegal(state.selection, field)) {
        const completed = state.position.makeMove(state.selection, field)
        return { ...state, selection: completed ? null : field }
      }
      return { ...state }
    default:
      throw new Error('INVALID ACTION TYPE')
  }
}
