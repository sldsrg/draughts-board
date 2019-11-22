import {Field} from './field'

export interface InteractionState {
  stage: 'idle' | 'primary' | 'progress' | 'pending',
  notation: string
}

export type InteractiveAction =
  {type: 'select', sqaure: number} |
  {type: 'hoop', sqaure: number} |
  {type: 'chop', sqaure: number, final: boolean} |
  {type: 'reset'}


export const INITIAL_INTERACTION_STATE: InteractionState = {
  stage: 'idle',
  notation: ''
}

export function interactionReducer(
  state: InteractionState,
  action: InteractiveAction): InteractionState {
  switch (action.type) {
    case 'select':
      return {stage: 'primary', notation: Field.fromIndex(action.sqaure).toString()}
    case 'hoop':
      if ('primary' === state.stage) {
        const target = Field.fromIndex(action.sqaure).toString()
        return {
          ...state,
          stage: 'pending',
          notation: `${state.notation}-${target}`
        }
      } else {
        throw new Error('Illegal state on action "hoop')
      }
    case 'chop':
      if (['primary', 'progress'].includes(state.stage)) {
        const target = Field.fromIndex(action.sqaure).toString()
        return {
          ...state,
          stage: action.final ? 'pending' : 'progress',
          notation: `${state.notation}:${target}`
        }
      } else {
        throw new Error('Illegal state on action "hoop')
      }
    case 'reset':
      return INITIAL_INTERACTION_STATE
  }
}