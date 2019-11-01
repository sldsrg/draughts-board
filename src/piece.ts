import { Field } from './field'
import { Position } from "./position"
import { Vector } from './vector'

export class Piece {
  public pos: Field

  constructor(
    public isWhite: boolean,
    public key: number,
    pos: Field,
    public isKing: boolean = false
  ) {
    this.pos = new Field(pos.row, pos.column)
  }

  /**
   * canCaptureAt
   */
  public canCaptureAt(context: Position, target: Field): boolean {
    const victim = context.at(target)
    if (!victim || (victim as Piece).isWhite === this.isWhite) return false
    if (context.at(this.pos.nextTo(target))) return false
    return true
  }

  /**
   * canCapture
   *
   * return true if this piece can capture
   * regardless of turn
   */
  public canCapture(context: Position): boolean {

    if (this.pos.row > 1
      && this.pos.column < 6
      && this.canCaptureAt(context, this.pos.next(-1, 1))
    ) return true

    if (this.pos.row > 1
      && this.pos.column > 1
      && this.canCaptureAt(context, this.pos.next(-1, -1))
    ) return true

    if (this.pos.row < 6
      && this.pos.column < 6
      && this.canCaptureAt(context, this.pos.next(1, 1))
    ) return true

    if (this.pos.row < 6
      && this.pos.column > 1
      && this.canCaptureAt(context, this.pos.next(1, -1))
    ) return true

    return false
  }

  /**
   * canMove
   *
   * return true if piece can make any quiet move or capture
   * regardless of turn or obligatory capture
   */
  public canMove(context: Position, to?: Field): boolean {
    // if target present check only one
    if (to) {
      if (context.at(to)) return false // target field must be empty
      const vector = Vector.get(this.pos, to)
      if (vector.isUnit) {
        // TODO: separate logic for king
        return this.isWhite === vector.deltaRow < 0
      } else {
        // TODO: separate logic for king
        if (this.canCaptureAt(context, this.pos.shift(vector.step))) return true
        return false
      }
    } else {
      // otherwise check all possibilities

      // can capture?
      if (this.canCapture(context)) return true

      // can make quiet move
      if (this.isKing) {
        // up and down

      } else if (this.isWhite) {
        // up only
        if (this.pos.column > 0 && !context.at(this.pos.next(-1, -1))) return true
        if (this.pos.column < 7 && !context.at(this.pos.next(-1, 1))) return true
      } else {
        // down only
        if (this.pos.column > 0 && !context.at(this.pos.next(1, -1))) return true
        if (this.pos.column < 7 && !context.at(this.pos.next(1, 1))) return true
      }
    }
    return false
  }
}
