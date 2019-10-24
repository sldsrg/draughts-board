import React from 'react'
import { createUseStyles } from 'react-jss'

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
  row: number
  column: number
}

export function WhiteMan(props: IProps) {
  const classes = useStyles()
  const cx = props.column * 80 + 40
  const cy = props.row * 80 + 40
  return (
    <>
      <circle className={classes.whitePiece} fill='white' cx={cx} cy={cy} r={36} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={29} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={20} />
      <circle className={classes.whitePiece} fill='transparent' cx={cx} cy={cy} r={16} />
    </>
  )
}

export function BlackMan(props: IProps) {
  const classes = useStyles()
  const cx = props.column * 80 + 40
  const cy = props.row * 80 + 40
  return (
    <>
      <circle className={classes.blackPiece} fill='black' cx={cx} cy={cy} r={36} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={29} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={20} />
      <circle className={classes.blackPiece} fill='transparent' cx={cx} cy={cy} r={16} />
    </>
  )
}
