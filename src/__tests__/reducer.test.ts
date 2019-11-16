import {Action, getReducer, IState} from '../reducer'
import {c3, d4, c5, a7, g1, b8, e1, c7, b2} from './utils/namedSquares'
import {newGame, setUp} from '../tools'

describe('reducer', () => {
  let reducer: (state: IState, action: Action) => IState

  beforeEach(() => {
    reducer = getReducer()
  })

  describe('action "init" ', () => {
    let state: IState

    beforeEach(() => {
      // some dirty state
      const board = Array(64).fill(null)
      board[a7] = 0
      board[g1] = 1
      state = {
        pieces: ['m', 'M'],
        board,
        whitesTurn: false,
        selection: g1,
        captureInProgress: true,
        belongsToMoveNumber: 3
      }
    })

    it('clears selection and captureInProgress', () => {
      const res = reducer(state, {type: 'init'})
      expect(res.selection).toBeUndefined()
      expect(res.captureInProgress).toBeUndefined()
    })

    it('assigns true to whitesTurn and 1 to moveNumber', () => {
      const res = reducer(state, {type: 'init'})
      expect(res.whitesTurn).toBe(true)
      expect(res.belongsToMoveNumber).toBe(1)
    })

    it('assigns initial position when payload is undefined', () => {
      const res = reducer(state, {type: 'init'})
      expect(res).toEqual(newGame())
    })

    it('assigns specified in payload position', () => {
      const res = reducer(state, {type: 'init', position: 'a1 b2, a7 b8'})
      expect(res.board.filter(x => x !== null)).toHaveLength(4)
      expect(res.pieces).toHaveLength(4)
    })
  })

  describe('action "select"', () => {
    it('set selection when payload is defined', () => {
      const state = newGame()
      const res = reducer(state, {type: 'select', at: c3})
      expect(res.selection).toBe(c3)
    })
  })

  describe('action "move"', () => {
    it('changes board according to source and target from payload', () => {
      const state = newGame()
      const key = state.board[c3]
      const res = reducer(state, {type: 'move', from: c3, to: d4})
      expect(res.board[c3]).toBeNull()
      expect(res.board[d4]).toBe(key)
      expect(res.selection).toBe(d4)
    })
  })

  describe('action "remove"', () => {
    it('changes board according to current selection and target from payload', () => {
      const state = setUp('d4 f4, c3 f6')
      const key = state.board[c3] as number
      const res = reducer(state, {type: 'remove', from: c3})
      expect(res.board[c3]).toBeNull()
      expect(res.pieces[key]).toBe('')
    })

    it('assigns true to captureInProgress', () => {
      const state = setUp('d4 f4, c3 f6')
      const key = state.board[c3] as number
      const res = reducer(state, {type: 'remove', from: c3})
      expect(res.captureInProgress).toBe(true)
    })
  })

  describe('action "promote"', () => {
    it('converts piece to king if one is man', () => {
      const state = setUp('b8, d6')
      const res = reducer(state, {type: 'convert', at: b8})
      expect(res.pieces[0]).toBe('K')
    })

    it('converts piece to man if one is king', () => {
      const state = setUp('king b8, d6')
      const res = reducer(state, {type: 'convert', at: b8})
      expect(res.pieces[0]).toBe('M')
    })
  })

  describe('action "restore"', () => {
    it('restore previously saved state', () => {
      const board = Array(64).fill(null)
      board[c7] = 0
      board[e1] = 1
      const savedState = {
        pieces: ['m', 'M'],
        board,
        whitesTurn: true,
        selection: c7,
        moveNumber: 1
      }
      const state = newGame()
      const res = reducer(state, {type: 'restore', with: savedState})
      expect(res).toEqual(savedState)
    })
  })

  describe('action "advance"', () => {
    describe('with inactive capture mode', () => {
      it('clears selection, toggles whitesTurn value and increments move number', () => {
        const state = newGame()
        state.belongsToMoveNumber = 1
        state.selection = c3
        const res = reducer(state, {type: 'advance'})
        expect(res.selection).toBeUndefined()
        expect(res.whitesTurn).toBe(false)
        expect(res.belongsToMoveNumber).toBe(2)
      })
    })

    describe('with active capture mode', () => {

      describe('when capture is last in sequence', () => {
        let state: IState

        beforeEach(() => {
          state = setUp('c3 e5, d4 f6')
          state.belongsToMoveNumber = 1
          state.selection = c3
          state.captureInProgress = true
        })

        it('clears selection', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.selection).toBeUndefined()
        })

        it('clears captureInProgress flag', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.captureInProgress).toBeUndefined()
        })

        it('toggles whitesTurn value', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.whitesTurn).toBe(false)
        })

        it('increments move number', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.belongsToMoveNumber).toBe(2)
        })
      })

      describe('when capture should be continued', () => {
        let state: IState

        beforeEach(() => {
          state = setUp('c3, d4 f6')
          state.belongsToMoveNumber = 1
          state.selection = c3
          state.captureInProgress = true
        })

        it('keeps untouched selection', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.selection).toBe(c3)
        })

        it('keeps untouched whitesTurn', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.whitesTurn).toBe(true)
        })

        it('keeps untouched captureInProgress flag', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.captureInProgress).toBe(true)
        })

        it('keeps untouched move number', () => {
          const res = reducer(state, {type: 'advance'})
          expect(res.belongsToMoveNumber).toBe(1)
        })
      })
    })
  })

})
