import { newGame, setUp, parseMove, shouldCapture, snapshot, hasAnyMove } from '../tools'
import {
  d4, c5, c3, b4, d6, b6, e3, g1, b8, e1, f2, e5, f4, g3, f6, a1, a7, h8, g7, b2, c7, e7, c1, a3
} from './utils/namedSquares'

describe('board', () => {
  describe('function "newGame"', () => {
    it('returns corresponding to initial position data', () => {
      const { board, pieces, whitesTurn } = newGame()
      expect(board).toEqual([
        null, 1, null, 3, null, 5, null, 7,
        8, null, 10, null, 12, null, 14, null,
        null, 17, null, 19, null, 21, null, 23,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        40, null, 42, null, 44, null, 46, null,
        null, 49, null, 51, null, 53, null, 55,
        56, null, 58, null, 60, null, 62, null
      ])
      expect(pieces).toEqual([
        null, 'm', null, 'm', null, 'm', null, 'm',
        'm', null, 'm', null, 'm', null, 'm', null,
        null, 'm', null, 'm', null, 'm', null, 'm',
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        'M', null, 'M', null, 'M', null, 'M', null,
        null, 'M', null, 'M', null, 'M', null, 'M',
        'M', null, 'M', null, 'M', null, 'M', null
      ])
      expect(whitesTurn).toBe(true)
    })
  })

  describe('function "setUp"', () => {
    it('returns corresponding to specified position data', () => {
      const { board, pieces, whitesTurn } =
        setUp('Whites: king d8 mans a1 c1, blacks: king f2 mans h8 h6')
      expect(board).toEqual([
        null, null, null, 3, null, null, null, 7,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, 23,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, 53, null, null,
        56, null, 58, null, null, null, null, null
      ])
      expect(pieces).toEqual([
        null, null, null, 'K', null, null, null, 'm',
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, 'm',
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, 'k', null, null,
        'M', null, 'M', null, null, null, null, null
      ])
      expect(whitesTurn).toBe(true)
    })

    it('detects blacks turn', () => {
      const { whitesTurn } = setUp('Whites: b2 c3, Blacks: f6 g7 blacks turn')
      expect(whitesTurn).toBe(false)
    })
  })

  describe('function "snapshot"', () => {
    it('returns correct representation', () => {
      const { board, pieces, whitesTurn } = setUp('whites: king b2 man c3, blacks: king f6 man g7')
      expect(snapshot(board, pieces, whitesTurn)).toBe('Whites: king b2 man c3, Blacks: king f6 man g7')
    })

    it('respects blacks turn', () => {
      const { board, pieces, whitesTurn } = setUp('b2 c3, f6 g7 blacks turn')
      expect(snapshot(board, pieces, whitesTurn)).toBe('Whites: b2 c3, Blacks: f6 g7 blacks turn')
    })
  })

  describe('function "parseMove"', () => {
    describe('for any move', () => {

      it('returns null when source square empty', () => {
        const { board, pieces } = newGame()
        expect(parseMove(board, pieces, b4, c5)).toBeNull()
      })

      it('returns null when target square index out of range', () => {
        const { board, pieces } = newGame()
        expect(parseMove(board, pieces, b4, -4)).toBeNull()
        expect(parseMove(board, pieces, b4, 69)).toBeNull()
      })

      it('returns null when target deviates from diagonal', () => {
        const { board, pieces } = setUp('king b2 man c3, c5')
        expect(parseMove(board, pieces, c3, c5)).toBeNull()
        expect(parseMove(board, pieces, b2, c7)).toBeNull()
      })

      it('returns null when target field is not empty', () => {
        const { board, pieces } = setUp('d4, b6 c5')
        expect(parseMove(board, pieces, d4, c5)).toBeNull()
      })
    })

    describe('for man’s quiet move', () => {
      it('returns null when white man go back', () => {
        const { board, pieces } = setUp('d4, b6 c5')
        expect(parseMove(board, pieces, d4, c3)).toBeNull()
        expect(parseMove(board, pieces, d4, e3)).toBeNull()
      })

      it('returns null when black man go back', () => {
        const { board, pieces } = setUp('d4, b6 c5')
        expect(parseMove(board, pieces, c5, b6)).toBeNull()
        expect(parseMove(board, pieces, c5, d6)).toBeNull()
      })

      it('returns null for long jump', () => {
        const { board, pieces } = setUp('e1 g1, b8 d8') // whites turn
        expect(parseMove(board, pieces, g1, e3)).toBeNull()
        expect(parseMove(board, pieces, b8, d6)).toBeNull()
      })

      it('returns null when other piece can capture', () => {
        const { board, pieces } = setUp('e1 g1, d2')
        expect(parseMove(board, pieces, g1, f2)).toBeNull()
      })

      it('returns null when moved piece can capture in other direction', () => {
        const { board, pieces } = setUp('e1 g1, d2')
        expect(parseMove(board, pieces, e1, f2)).toBeNull()
      })
    })

    describe('for man\'s move with capture', () => {
      it('returns null when captured piece missed', () => {
        const { board, pieces } = setUp('e3 g3, b6 d6')
        expect(parseMove(board, pieces, g3, e5)).toBeNull()
        expect(parseMove(board, pieces, d6, f4)).toBeNull()
      })

      it('returns null when captured own piece', () => {
        const { board, pieces } = setUp('e3 d4, f6 g7')
        expect(parseMove(board, pieces, e3, c5)).toBeNull()
        expect(parseMove(board, pieces, g7, e5)).toBeNull()
      })

      it('returns two actions (move and remove) for valid capture', () => {
        const { board, pieces } = setUp('e3 d4, d6 e5')
        expect(parseMove(board, pieces, d4, f6)).toEqual([
          { type: 'move', from: d4, to: f6 },
          { type: 'remove', from: e5 }])
        expect(parseMove(board, pieces, e5, c3)).toEqual([
          { type: 'move', from: e5, to: c3 },
          { type: 'remove', from: d4 }])
      })

      it('returns actions even if other piece can capture', () => {
        const { board, pieces } = setUp('e1 g1, d2 f2')
        expect(parseMove(board, pieces, g1, e3)).toEqual([
          { type: 'move', from: g1, to: e3 },
          { type: 'remove', from: f2 }])
      })

      it('returns actions even if that piece can capture in other direction', () => {
        const { board, pieces } = setUp('e1 g1, d2 f2')
        expect(parseMove(board, pieces, e1, g3)).toEqual([
          { type: 'move', from: e1, to: g3 },
          { type: 'remove', from: f2 }])
      })
    })

    describe('for king’s quiet move', () => {
      it('returns null when other piece can capture', () => {
        const { board, pieces } = setUp('kings e1 g1, c3')
        expect(parseMove(board, pieces, g1, e3)).toBeNull()
      })

      it('returns null when moved piece can capture in other direction', () => {
        const { board, pieces } = setUp('kings e1 g1, c3')
        expect(parseMove(board, pieces, e1, f2)).toBeNull()
      })
    })

    describe('for king’s move with capture', () => {
      it('returns null when captured own piece', () => {
        const { board, pieces } = setUp('king a1 d4, king b8 c7') // whites turn
        expect(parseMove(board, pieces, a1, f6)).toBeNull()
        expect(parseMove(board, pieces, b8, e5)).toBeNull()
      })

      it('returns null when capturing two adjoining pieces', () => {
        const { board, pieces } = setUp('king b2 c3, king f6 g7') // whites turn
        expect(parseMove(board, pieces, c3, h8)).toBeNull()
        expect(parseMove(board, pieces, f6, a1)).toBeNull()
      })

      it('returns two actions (move and remove) for valid capture', () => {
        const { board, pieces } = setUp('king a1 man f2, king a7 man g7')
        expect(parseMove(board, pieces, a1, h8)).toEqual([
          { type: 'move', from: a1, to: h8 },
          { type: 'remove', from: g7 }])
        expect(parseMove(board, pieces, a7, g1)).toEqual([
          { type: 'move', from: a7, to: g1 },
          { type: 'remove', from: f2 }])
      })

    })
  })

  describe('function "shouldCapture"', () => {
    describe('when passed piece is man', () => {

      it('returns false if there are no enemies on man’s adjacent squares', () => {
        const { board, pieces } = setUp('g1, b8')
        expect(shouldCapture(board, pieces, g1)).toBe(false)
      })

      it('returns false if adjacent enemy have piece from opposite side', () => {
        const { board, pieces } = setUp('e5, f6 g7')
        expect(shouldCapture(board, pieces, e5)).toBe(false)
      })

      it('returns false if the victim is at the edge of the board', () => {
        const { board, pieces } = setUp('f4, h5')
        expect(shouldCapture(board, pieces, f4)).toBe(false)
      })

      it('returns true if adjacent enemy have empty square from opposite side', () => {
        const { board, pieces } = setUp('c5 e5 d4 f4, b6 f6 e3')
        expect(shouldCapture(board, pieces, c5)).toBe(true)
        expect(shouldCapture(board, pieces, e5)).toBe(true)
        expect(shouldCapture(board, pieces, d4)).toBe(true)
        expect(shouldCapture(board, pieces, f4)).toBe(true)
      })
    })

    describe('when passed piece is king', () => {
      it('returns true for "long" capture', () => {
        const { board, pieces } = setUp('king b2, king g7')
        expect(shouldCapture(board, pieces, b2)).toBe(true)
        expect(shouldCapture(board, pieces, g7)).toBe(true)
      })

      it('returns false when own piece in between', () => {
        const { board, pieces } = setUp('king b2 man d4, king h8 man f6')
        expect(shouldCapture(board, pieces, b2)).toBe(false)
        expect(shouldCapture(board, pieces, h8)).toBe(false)
      })
    })

  })

  describe('function "hasAnyMove"', () => {
    describe('when passed piece is man', () => {
      it('returns false if blocked ahead with pieces of same color', () => {
        const { board, pieces } = setUp('a1 a3 b2 c1 c3 d4 f6, b6 c5 c7 d2 d6 e7')
        expect(hasAnyMove(board, pieces, b2)).toBe(false)
        expect(hasAnyMove(board, pieces, c7)).toBe(false)
      })

      it('returns true if there are empty squares ahead', () => {
        const { board, pieces } = setUp('a1 a3 b2 c1 c3 d4 f6, b6 c5 c7 d2 d6 e7')
        expect(hasAnyMove(board, pieces, a3)).toBe(true)
        expect(hasAnyMove(board, pieces, c3)).toBe(true)
        expect(hasAnyMove(board, pieces, b6)).toBe(true)
        expect(hasAnyMove(board, pieces, d6)).toBe(true)
      })

      it('returns true when only a capture is possible', () => {
        const { board, pieces } = setUp('a1 a3 b2 c1 c3 d4 f6, b6 c5 c7 d2 d6 e7')
        expect(hasAnyMove(board, pieces, c1)).toBe(true)
        expect(hasAnyMove(board, pieces, e7)).toBe(true)
      })
    })

    describe('when passed piece is king', () => {

    })
  })

})
