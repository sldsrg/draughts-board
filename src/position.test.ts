import { Position } from './position'
import {
  b8, c5, c7, d6, g1, e3, b6, f2, d4,
  b2, g7, c3, f6, e5, g3, f4
} from './utils/namedSquares'
import { Piece } from './piece'

describe('class Position', () => {
  describe('factory method *fromStart*', () => {
    it('returns initial position', () => {
      const pos = Position.fromStart()
      expect(pos.pieces).toHaveLength(24)
      expect(pos.pieces.filter(p => p.isWhite)).toHaveLength(12)
      expect(pos.pieces.filter(p => p.isKing)).toHaveLength(0)
      expect(pos.squares[3]).toEqual(new Array(8))
      expect(pos.squares[4]).toEqual(new Array(8))
    })
  })

  describe('factory method *fromString*', () => {
    it('parse position without kings', () => {
      const pos = Position.fromString('Whites: b2 c3, Blacks: f6 g7')
      expect(pos.pieces).toHaveLength(4)
      expect(pos.squares[6][1]).toEqual(new Piece(true, 0, b2))
      expect(pos.squares[5][2]).toEqual(new Piece(true, 1, c3))
      expect(pos.squares[2][5]).toEqual(new Piece(false, 2, f6))
      expect(pos.squares[1][6]).toEqual(new Piece(false, 3, g7))
    })

    it('detects blacks turn', () => {
      const pos = Position.fromString('Whites: b2 c3, Blacks: f6 g7 blacks turn')
      expect(pos.whitesTurn).toBe(false)
    })
  })

  describe('method *toString*', () => {
    it('returns correct representation', () => {
      const pos = Position.fromString('whites: b2 c3, blacks: f6 g7')
      expect(pos.toString()).toBe('Whites: b2 c3, Blacks: f6 g7')
    })

    it('respects blacks turn', () => {
      const pos = Position.fromString('b2 c3, f6 g7 blacks turn')
      expect(pos.toString()).toBe('Whites: b2 c3, Blacks: f6 g7 blacks turn')
    })
  })

  describe('method *encode*', () => {
    it('returns correct representation of initial position', () => {
      const pos = Position.fromStart()
      expect(pos.encode()).toBe(Position.INITIAL)
    })

    it('returns correct representation of arbitrary position', () => {
      const pos = Position.fromString('e1 g1, b8 d8 b')
      expect(pos.encode()).toBe('mm2/4/4/4/4/4/4/2MM b')
    })
  })

  describe('method *canMove*', () => {
    it('returns false when starting field is empty', () => {
      const pos = Position.fromStart()
      expect(pos.canMove(d4)).toBe(false)
    })

    it('returns false when wrong piece color selected', () => {
      let pos = Position.fromString('e1 g1, b8 d8 whites turn')
      expect(pos.canMove(b6)).toBe(false)
      pos = Position.fromString('e1 g1, b8 d8 blacks turn')
      expect(pos.canMove(g1)).toBe(false)
    })

    describe('for any move', () => {
      it('returns false when target field is not empty', () => {
        const pos = Position.fromString('d4, b6 c5')
        expect(pos.canMove(d4, c5)).toBe(false)
      })
    })

    describe("for man's move without capture", () => {
      it('returns false by wrong direction', () => {
        const pos = Position.fromString('e3 g3, b6 d6') // whites turn
        expect(pos.canMove(e3, f2)).toBe(false)
        pos.whitesTurn = false // blacks turn
        expect(pos.canMove(b6, c7)).toBe(false)
      })

      it('returns false for long jump', () => {
        const pos = Position.fromString('e1 g1, b8 d8') // whites turn
        expect(pos.canMove(g1, e3)).toBe(false)
        pos.whitesTurn = false // blacks turn
        expect(pos.canMove(b8, d6)).toBe(false)
      })
    })

    describe("for man's move with single capture", () => {
      it('returns false when captured piece missed', () => {
        const pos = Position.fromString('e3 g3, b6 d6') // whites turn
        expect(pos.canMove(g3, e5)).toBe(false)
        pos.whitesTurn = false // blacks turn
        expect(pos.canMove(d6, f4)).toBe(false)
      })

      it('returns false when captured own piece', () => {
        const pos = Position.fromString('e3 d4, d6 e5') // whites turn
        expect(pos.canMove(e3, c5)).toBe(false)
        pos.whitesTurn = false // blacks turn
        expect(pos.canMove(d6, f4)).toBe(false)
      })

      it('returns true when captured opponent’s piece', () => {
        const pos = Position.fromString('e3 d4, d6 e5') // whites turn
        expect(pos.canMove(d4, f6)).toBe(true)
        pos.whitesTurn = false // blacks turn
        expect(pos.canMove(e5, c3)).toBe(true)
      })
    })
  })

  describe('method *makeMove*', () => {
    it('changes position respectfully for quiet move', () => {
      const pos = Position.fromString('c3, f6')
      const subject = pos.at(c3) as Piece
      const completed = pos.makeMove(c3, d4)
      expect(completed).toBe(true)
      expect(subject.pos).toEqual(d4)
      expect(pos.at(c3)).toBeUndefined()
      expect(pos.at(d4)).toEqual(subject)
    })

    it('changes position respectfully for capture', () => {
      const pos = Position.fromString('c3, d4 d8')
      const subject = pos.at(c3) as Piece
      const completed = pos.makeMove(c3, e5)
      expect(completed).toBe(true)
      expect(subject.pos).toEqual(e5)
      expect(pos.at(c3)).toBeUndefined()
      expect(pos.at(d4)).toBeUndefined()
      expect(pos.at(e5)).toEqual(subject)
    })
  })
})
