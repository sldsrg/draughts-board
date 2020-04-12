import React from 'react'
import { createUseStyles } from 'react-jss'
import { FIELD_SIZE } from '../constants'

const useStyles = createUseStyles({
  whitePiece: {
    fill: 'white',
    stroke: 'darkGray',
    strokeWidth: 2,
    transition: 'all 700ms'
  },
  blackPiece: {
    fill: 'black',
    stroke: 'lightGray',
    strokeWidth: 2,
    transition: 'all 700ms'
  }
})

interface GlyphProps {
  id: number,
  code: string,
  square: number,
  selected: boolean,
  onClick: (event: React.MouseEvent) => void
}

export function Glyph(props: GlyphProps) {
  const { id, code, square, selected, onClick } = props
  const classes = useStyles()
  const row = square >> 3
  const column = square - (row << 3)
  const x = column * FIELD_SIZE + (FIELD_SIZE >> 1)
  const y = row * FIELD_SIZE + (FIELD_SIZE >> 1)
  const isKing = 'Kk'.includes(code)
  const isWhite = 'MK'.includes(code)

  return (
    <g
      className={isWhite ? classes.whitePiece : classes.blackPiece}
      style={{ transform: `translate(${x}px,${y}px)` }}
      data-testid={`piece${id}`}
      role={`${isWhite ? 'white' : 'black'}-${isKing ? 'king' : 'man'}`}
    >
      {selected && (
        <circle
          role='highlight'
          r={38}
          fill='transparent'
          stroke='yellow'
          strokeWidth={10}
          filter="url(#blur)"
        />
      )}
      <use href={isKing ? '#king' : '#man'} onClick={onClick} />
    </g>
  )
}
