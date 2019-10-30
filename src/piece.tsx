import React from 'react'
import { createUseStyles } from 'react-jss'
import { Field } from './field'

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
}

const useStyles = createUseStyles({
  whitePiece: {
    fill: 'white',
    stroke: 'darkGray',
    strokeWidth: 2,
    transition: '1s'
  },
  blackPiece: {
    fill: 'black',
    stroke: 'lightGray',
    strokeWidth: 2,
    transition: '1s'
  }
})

interface IProps {
  piece: Piece
}

export function Glyph(props: IProps) {
  const classes = useStyles()
  const x = props.piece.pos.column * 80 + 40
  const y = props.piece.pos.row * 80 + 40
  const pathData = `
    M ${x},${y}
    m -36,0 a 36,36 0 1,0 72,0 a 36,36 0 1,0 -72,0
    m 8,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0
    m 8,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0
  `
  return (
    <path
      d={pathData}
      className={props.piece.isWhite ? classes.whitePiece : classes.blackPiece}
    ></path>
  )
}
