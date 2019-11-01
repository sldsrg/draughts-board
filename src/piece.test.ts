import { Piece } from './piece'
import { Position } from './position'
import { c3, d4, c5, d6, e5, e3, g1, f4, a1, b2, c7, b6, a3, c1, e7 } from './utils/namedSquares'

describe('consider piece is a man not a king', () => {
  describe('method *canCapture*', () => {
    it('returns false if there are no enemies on man’s adjacent squares', () => {
      const context = Position.fromString('g1, b8')
      const piece = context.at(g1) as Piece
      expect(piece.canCapture(context)).toBe(false)
    })

    it('returns false if adjacent enemy have piece from opposite side', () => {
      const context = Position.fromString('e5, f6 g7')
      const piece = context.at(e5) as Piece
      expect(piece.canCapture(context)).toBe(false)
    })

    it('returns false if the victim is at the edge of the board', () => {
      const context = Position.fromString('f4, h5')
      const piece = context.at(f4) as Piece
      expect(piece.canCapture(context)).toBe(false)
    })

    it('returns true if adjacent enemy have empty square from opposite side', () => {
      const context = Position.fromString('c5 e5 d4 f4, b6 f6 e3')
      let piece = context.at(c5) as Piece
      expect(piece.canCapture(context)).toBe(true)
      piece = context.at(e5) as Piece
      expect(piece.canCapture(context)).toBe(true)
      piece = context.at(d4) as Piece
      expect(piece.canCapture(context)).toBe(true)
      piece = context.at(f4) as Piece
      expect(piece.canCapture(context)).toBe(true)
    })
  })

  describe('method *canMove*', () => {
    let context: Position

    beforeEach(() => {
      context = Position.fromString('a1 a3 b2 c1 c3 d4 f6, b6 c5 c7 d2 d6 e7')
    })

    it('returns false if blocked ahead with pieces of same color', () => {
      let piece = context.at(b2) as Piece
      expect(piece.canMove(context)).toBe(false)
      piece = context.at(c7) as Piece
      expect(piece.canMove(context)).toBe(false)
    })

    it('returns true if there are empty squares ahead', () => {
      let piece = context.at(a3) as Piece
      expect(piece.canMove(context)).toBe(true)
      piece = context.at(c3) as Piece
      expect(piece.canMove(context)).toBe(true)
      piece = context.at(b6) as Piece
      expect(piece.canMove(context)).toBe(true)
      piece = context.at(d6) as Piece
      expect(piece.canMove(context)).toBe(true)
    })

    it('returns true when only a capture is possible', () => {
      let piece = context.at(c1) as Piece
      expect(piece.canMove(context)).toBe(true)
      piece = context.at(e7) as Piece
      expect(piece.canMove(context)).toBe(true)
    })
  })
})

describe('consider piece is a king', () => {
  xit('to be done', () => { })
})