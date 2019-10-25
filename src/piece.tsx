import React from 'react'
import { createUseStyles } from 'react-jss'

export class Piece {
  constructor(
    public isWhite: boolean,
    public key: number,
    public row: number,
    public column: number
  ) {}
}

const useStyles = createUseStyles({
  whitePiece: {
    stroke: '#000000',
    strokeWidth: 2,
    transition: '1s'
  },
  blackPiece: {
    stroke: '#ffffff',
    strokeWidth: 2,
    transition: '1s'
  }
})

interface IProps {
  piece: Piece
}

export function Glyph(props: IProps) {
  const classes = useStyles()
  const cx = props.piece.column * 80 + 40
  const cy = props.piece.row * 80 + 40
  return props.piece.isWhite ? (
    <>
      <circle className={classes.whitePiece} fill='white' cx={cx} cy={cy} r={36} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={29} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={20} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={16} />
    </>
  ) : (
    <>
      <circle className={classes.blackPiece} fill='black' cx={cx} cy={cy} r={36} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={29} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={20} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={16} />
    </>
  )
}
