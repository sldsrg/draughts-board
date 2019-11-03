import { reducer, IState } from './reducer'
import { Position } from './position'
import { c3, d4, c5, d6, e5, e3 } from './utils/namedSquares'
import { Field } from './field'

describe('reducer', () => {
  describe('action *init* ', () => {
    let state: IState

    beforeEach(() => {
      state = { selection: e3, position: Position.fromStart() }
    })

    it('assigns null to selection', () => {
      const res = reducer(state, { type: 'init' })
      expect(res.selection).toBeNull()
    })

    it('assigns true to whitesTurn', () => {
      const res = reducer(state, { type: 'init' })
      expect(res.position.whitesTurn).toBe(true)
    })

    it('assigns initial position when payload is undefined', () => {
      const res = reducer(state, { type: 'init' })
      expect(res.position.encode()).toBe(Position.INITIAL)
    })
  })

  describe('action *click* without previous selection', () => {
    let state: IState

    beforeEach(() => {
      state = { selection: null, position: Position.fromStart() }
    })

    it('has no effect when clicked empty field and selection is null', () => {
      const res = reducer(state, { type: 'click', payload: e5 })
      expect(res).toEqual(state)
    })

    it('has no effect when targeted piece is white an whitesTurn is false', () => {
      state.position.whitesTurn = false
      const res = reducer(state, { type: 'click', payload: c3 })
      expect(res).toEqual(state)
    })

    it('has no effect when targeted piece is black an whitesTurn is true', () => {
      const res = reducer(state, { type: 'click', payload: d6 })
      expect(res).toEqual(state)
    })

    it('selects targeted piece if one is white an whitesTurn is true', () => {
      const res = reducer(state, { type: 'click', payload: c3 })
      expect(res.selection).toEqual(c3)
    })

    it('selects targeted piece if one is black an whitesTurn is false', () => {
      state.position.whitesTurn = false
      const res = reducer(state, { type: 'click', payload: d6 })
      expect(res.selection).toEqual(d6)
    })
  })

  describe('action *click* with previous selection', () => {

    it('make move when clicked field is legal move target', () => {
      const state = { selection: c3, position: Position.fromStart() }
      // legal move c3-d4
      const res = reducer(state, { type: 'click', payload: d4 })
      expect(res.position.encode()).toEqual('mmmm/mmmm/mmmm/4/1M2/M1MM/MMMM/MMMM b')
      expect(res.selection).toBeNull()
    })

    it('can not move when clicked field is illegal move target', () => {
      const state = { selection: c3, position: Position.fromStart() }
      // illegal move c3-c5
      const res = reducer(state, { type: 'click', payload: c5 })
      expect(res.position.encode()).toEqual(Position.INITIAL)
      expect(res.selection).toEqual(state.selection)
    })

    it('moves selection in case of capture continuation', () => {
      const state = {
        selection: c3,
        position: Position.fromString('c3, d4 f6')
      }
      const res = reducer(state, { type: 'click', payload: e5 })
      expect(res.selection).toEqual(e5)
    })
  })
})
