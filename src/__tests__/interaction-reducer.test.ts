import {
  interactionReducer as reducer, INITIAL_INTERACTION_STATE, InteractionState
} from '../interaction-reducer'
import {a1, c1, c3} from './utils/namedSquares'

describe('interaction reducer', () => {
  describe('action "select"', () => {
    it('changes stage to "primary"', () => {
      const state = INITIAL_INTERACTION_STATE
      const res = reducer(state, {type: 'select', sqaure: a1})
      expect(res.stage).toBe('primary')
    })

    it('updates move notation to selected square', () => {
      const state = INITIAL_INTERACTION_STATE
      const res = reducer(state, {type: 'select', sqaure: a1})
      expect(res.notation).toBe('a1')
    })

    it('replaces previous notation in case of reselection', () => {
      const state = INITIAL_INTERACTION_STATE
      let res = reducer(state, {type: 'select', sqaure: a1})
      res = reducer(state, {type: 'select', sqaure: c1})
      expect(res.notation).toBe('c1')
    })
  })

  describe('action "hoop"', () => {
    it('raises expection when dispatched on stage "idle"', () => {
      const state = INITIAL_INTERACTION_STATE
      expect(() => reducer(state, {type: 'hoop', sqaure: c3})).toThrow()
    })

    it('raises expection when dispatched on stage "progress"', () => {
      const state = INITIAL_INTERACTION_STATE
      state.stage = 'progress'
      expect(() => reducer(state, {type: 'hoop', sqaure: c3})).toThrow()
    })

    it('raises expection when dispatched on stage "pending"', () => {
      const state = INITIAL_INTERACTION_STATE
      state.stage = 'pending'
      expect(() => reducer(state, {type: 'hoop', sqaure: c3})).toThrow()
    })

    it('appends hyphen and square to notation', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'hoop', sqaure: c3})
      expect(res.notation).toBe('a1-c3')
    })

    it('changes stage to "pending"', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'hoop', sqaure: c3})
      expect(res.stage).toBe('pending')
    })

  })

  describe('action "chop"', () => {
    it('raises expection when dispatched on stage "idle"', () => {
      const state = INITIAL_INTERACTION_STATE
      expect(() => reducer(state, {type: 'chop', sqaure: c3, final: true})).toThrow()
    })

    it('raises expection when dispatched on stage "pending"', () => {
      const state = INITIAL_INTERACTION_STATE
      state.stage = 'pending'
      expect(() => reducer(state, {type: 'chop', sqaure: c3, final: true})).toThrow()
    })

    it('appends colon and square to notation', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'chop', sqaure: c3, final: true})
      expect(res.notation).toBe('a1:c3')
    })

    it('changes stage to "progress" if final is false', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'chop', sqaure: c3, final: false})
      expect(res.stage).toBe('progress')
    })

    it('changes stage to "pending" if final is true', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'chop', sqaure: c3, final: true})
      expect(res.stage).toBe('pending')
    })

  })

  describe('action "reset"', () => {
    it('resets state to initial one', () => {
      const state: InteractionState = {stage: 'primary', notation: 'a1'}
      const res = reducer(state, {type: 'reset'})
      expect(res).toMatchObject(INITIAL_INTERACTION_STATE)
    })
  })
})