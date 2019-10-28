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
  const x = props.piece.column * 80 + 40
  const y = props.piece.row * 80 + 40
  const pathData = `
    M ${x},${y}
    m -36,0 a 36,36 0 1,0 72,0 a 36,36 0 1,0 -72,0
    m 8,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0
    m 8,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0
  `
  return props.piece.isWhite ? (
    <path d={pathData} className={classes.whitePiece}></path>
  ) : (
    // <>
    //   <circle className={classes.whitePiece} fill='white'  r={36} />
    //   <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={29} />
    //   <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={20} />
    //   <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={16} />
    // </>
    <path d={pathData} className={classes.blackPiece}></path>

    // <>
    //   <circle className={classes.blackPiece} fill='black' cx={cx} cy={cy} r={36} />
    //   <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={29} />
    //   <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={20} />
    //   <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={16} />
    // </>
  )
}
