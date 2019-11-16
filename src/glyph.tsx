import React from 'react'
import { createUseStyles } from 'react-jss'
import { FIELD_SIZE } from './constants'

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

export function Definitions() {
  return (
    <defs>
      <filter id="blur">
        <feGaussianBlur stdDeviation="3" />
      </filter>
      <path id='man' d={`
        m -36,0 a 36,36 0 1,0 72,0 a 36,36 0 1,0 -72,0
        m 8,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0
        m 8,0 a 20,20 0 1,0 40,0 a 20,20 0 1,0 -40,0
      `}>
      </path>
      <path id='king' d={`
        m -36,0 a 36,36 0 1,0 72,0 a 36,36 0 1,0 -72,0
        m 6,0 a 30,30 0 1,0 60,0 30,30 0 1,0 -60,0
        m 13,8 v 0 6 a 2,2 0 0 0 2,2 v 0 h 30 a 2,2 0 0 0 2,-2 v 0 -6 z
        m 14.5,-8 a 2.5,2.5 0 1 0 5,0 2.5,2.5 0 1 0 -5,0
        m 19.7,5.5 c 0.504,-5.004 2.98,-9.014 3.563,-10.292 0.88,0.157 1.813,-0.204 2.465,-0.864 0.652,-0.66 0.967,-2.33 -0.037,-3.467 -0.895,-1.012 -2.498,-1.202 -3.45,-0.542 -0.864,0.6 -1.506,1.91 -1.2,2.971 l -4.492,2.75 c -0.672,-1.544 -0.766,-6.473 -0.855,-8.292 0.723191,-0.435283 1.167326,-1.21593 1.172,-2.06 0,-1.343 -1.12,-2.436 -2.499,-2.436 -1.378,0 -2.499,1.093 -2.499,2.436 0,0.605 0.23,1.158 0.606,1.585 -1.237,3.006 -3.497,5.918 -4.984,6.951 -1.779,-2.204 -2.81,-8.258 -2.919,-11.047 0.584962,-0.454668 0.92829,-1.153125 0.931,-1.894 0,-1.343 -1.12,-2.436 -2.499,-2.436 -1.378,0 -2.498,1.093 -2.498,2.436 0,0.765 0.363,1.447 0.93,1.894 -0.776,3.513 -1.149,8.776 -2.984,11.092 -1.486,-0.92 -3.457,-4.542 -4.918,-6.996 0.376,-0.427 0.605,-0.98 0.605,-1.585 0,-1.343 -1.12,-2.436 -2.499,-2.436 -1.378,0 -2.498,1.093 -2.498,2.436 0,0.868 0.469,1.629 1.172,2.06 -0.088,1.82 -0.063,5.726 -0.58,7.78 l -4.628,-2.349 c 0.318,-0.688 -0.009,-1.94 -0.647,-2.533 -1.244,-1.155 -3.275,-0.817 -4.084,0.234 -0.809,1.05 -0.927,2.783 0.087,3.687 0.788,0.702 1.8,0.858 2.302,0.686 2.228,2.484 2.715,7.904 2.984,10.22 z
    `}
      ></path>
    </defs>
  )
}

interface IProps {
  id: number,
  code: string,
  square: number,
  selected: boolean,
  onClick: (event: React.MouseEvent) => void
}

export function Glyph(props: IProps) {
  const { id, code, square, selected, onClick } = props
  const classes = useStyles()
  const row = square >> 3
  const column = square - (row << 3)
  const x = column * FIELD_SIZE + (FIELD_SIZE >> 1)
  const y = row * FIELD_SIZE + (FIELD_SIZE >> 1)
  const isKing = 'Kk'.includes(code)
  const isWhite = 'MK'.includes(code)

  return (
    <>
      {selected && (
        <circle
          role='highlight'
          cx={x}
          cy={y}
          r={(FIELD_SIZE >> 1) - 2}
          fill='transparent'
          stroke='yellow'
          strokeWidth={10}
          filter="url(#blur)"
        />
      )}
      <use
        x={x} y={y}
        data-testid={`piece${id}`}
        role={`${isWhite ? 'white' : 'black'}-${isKing ? 'king' : 'man'}`}
        href={isKing ? '#king' : '#man'}
        className={isWhite ? classes.whitePiece : classes.blackPiece}
        onClick={onClick}
      ></use>
    </>
  )
}
