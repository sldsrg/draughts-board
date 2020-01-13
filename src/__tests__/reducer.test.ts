import {reducer, State, INITIAL_STATE} from '../reducer'
import {c3, d4, e1, c7, a1, c1} from './utils/namedSquares'
import {newGame, setUp} from '../tools'

describe('reducer', () => {

  describe('action "move"', () => {
    it('changes board according to source and target from payload', () => {
      const state = {...INITIAL_STATE, ...newGame()}
      const key = state.board[c3]
      const res = reducer(state, {type: 'move', from: c3, to: d4})
      expect(res.board[c3]).toBeNull()
      expect(res.board[d4]).toBe(key)
    })
  })

  describe('action "remove"', () => {
    it('changes board according to current selection and target from payload', () => {
      const state = {...INITIAL_STATE, ...setUp('d4 f4, c3 f6')}
      const key = state.board[c3] as number
      const res = reducer(state, {type: 'remove', from: c3})
      expect(res.board[c3]).toBeNull()
      expect(res.pieces[key]).toBe('')
    })
  })

  describe('action "restore"', () => {
    it('restore previously saved state', () => {
      const board = Array(64).fill(null)
      board[c7] = 0
      board[e1] = 1
      const savedState: State = {
        pieces: ['m', 'M'],
        board,
        stage: 'idle',
        notation: ''
      }
      const state = {...INITIAL_STATE, ...newGame()}
      const res = reducer(state, {type: 'restore', with: savedState})
      expect(res).toMatchObject(savedState)
    })
  })

  describe('action "select"', () => {
    it('changes stage to "initiation"', () => {
      const state = INITIAL_STATE
      const res = reducer(state, {type: 'select', square: a1})
      expect(res.stage).toBe('initiation')
    })

    it('updates move notation to selected square', () => {
      const state = INITIAL_STATE
      const res = reducer(state, {type: 'select', square: a1})
      expect(res.notation).toBe('a1')
    })

    it('replaces previous notation in case of reselection', () => {
      const state = INITIAL_STATE
      let res = reducer(state, {type: 'select', square: a1})
      res = reducer(state, {type: 'select', square: c1})
      expect(res.notation).toBe('c1')
    })
  })

  describe('action "hoop"', () => {
    it('raises exception when dispatched on stage "idle"', () => {
      const state = INITIAL_STATE
      expect(() => reducer(state, {type: 'hoop', square: c3})).toThrow()
    })

    it('raises exception when dispatched on stage "capture"', () => {
      const state = INITIAL_STATE
      state.stage = 'capture'
      expect(() => reducer(state, {type: 'hoop', square: c3})).toThrow()
    })

    it('raises exception when dispatched on stage "pending"', () => {
      const state = INITIAL_STATE
      state.stage = 'pending'
      expect(() => reducer(state, {type: 'hoop', square: c3})).toThrow()
    })

    it('appends hyphen and square to notation', () => {
      const state: State = {board: [], pieces: [], stage: 'initiation', notation: 'a1'}
      const res = reducer(state, {type: 'hoop', square: c3})
      expect(res.notation).toBe('a1-c3')
    })

    it('changes stage to "pending"', () => {
      const state: State = {board: [], pieces: [], stage: 'initiation', notation: 'a1'}
      const res = reducer(state, {type: 'hoop', square: c3})
      expect(res.stage).toBe('pending')
    })

  })

  describe('action "chop"', () => {
    it('raises exception when dispatched on stage "idle"', () => {
      const state = INITIAL_STATE
      expect(() => reducer(state, {type: 'chop', square: c3})).toThrow()
    })

    it('raises exception when dispatched on stage "pending"', () => {
      const state = INITIAL_STATE
      state.stage = 'pending'
      expect(() => reducer(state, {type: 'chop', square: c3})).toThrow()
    })

    it('appends colon and square to notation', () => {
      const state: State = {board: [], pieces: [], stage: 'initiation', notation: 'a1'}
      const res = reducer(state, {type: 'chop', square: c3})
      expect(res.notation).toBe('a1:c3')
    })

    it('changes stage to "capture"', () => {
      const state = {...INITIAL_STATE, ...setUp('c3, b2 d4')}
      state.stage = 'initiation'
      state.notation = 'a1'
      const res = reducer(state, {type: 'chop', square: c3})
      expect(res.stage).toBe('capture')
    })
  })

  describe('action "reset"', () => {
    it('resets stage to "idle" and clears notation', () => {
      const state: State = {board: [], pieces: [], stage: 'initiation', notation: 'a1'}
      const res = reducer(state, {type: 'reset'})
      expect(res.stage).toBe('idle')
      expect(res.notation).toBe('')
    })
  })

  // describe('action "advance"', () => {
  //   describe('with inactive capture mode', () => {
  // eslint-disable-next-line max-len
  //     it('clears selection, toggles whitesTurn, increments move number and resets move stage', () => {
  //       const state = newGame()
  //       state.atMoveNumber = 1
  //       state.atMoveStage = 2
  //       state.selection = c3
  //       const res = reducer(state, {type: 'advance'})
  //       expect(res.selection).toBeUndefined()
  //       expect(res.whitesTurn).toBe(false)
  //       expect(res.atMoveNumber).toBe(2)
  //       expect(res.atMoveStage).toBe(0)
  //     })
  //   })

  //   describe('with active capture mode', () => {

  //     describe('when capture is last in sequence', () => {
  //       let state: State

  //       beforeEach(() => {
  //         state = setUp('c3 e5, d4 f6')
  //         state.atMoveNumber = 1
  //         state.selection = c3
  //         state.captureInProgress = true
  //       })

  //       it('clears selection', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.selection).toBeUndefined()
  //       })

  //       it('clears captureInProgress flag', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.captureInProgress).toBeUndefined()
  //       })

  //       it('toggles whitesTurn value', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.whitesTurn).toBe(false)
  //       })

  //       it('increments move number', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.atMoveNumber).toBe(2)
  //       })
  //     })

  //     describe('when capture should be continued', () => {
  //       let state: State

  //       beforeEach(() => {
  //         state = setUp('c3, d4 f6')
  //         state.atMoveNumber = 1
  //         state.selection = c3
  //         state.captureInProgress = true
  //       })

  //       it('keeps untouched selection', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.selection).toBe(c3)
  //       })

  //       it('keeps untouched whitesTurn', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.whitesTurn).toBe(true)
  //       })

  //       it('keeps untouched captureInProgress flag', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.captureInProgress).toBe(true)
  //       })

  //       it('keeps untouched move number', () => {
  //         const res = reducer(state, {type: 'advance'})
  //         expect(res.atMoveNumber).toBe(1)
  //       })
  //     })
  //   })
  // })

})
