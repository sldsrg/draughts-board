import React from 'react'
import { FIELD_SIZE } from '../constants'

import css from './Glyph.css'

interface GlyphProps {
  id: number,
  code: string,
  square: number,
  selected: boolean,
  onClick: (event: React.MouseEvent) => void
}

export function Glyph(props: GlyphProps) {
  const { id, code, square, selected, onClick } = props

  const row = square >> 3
  const column = square - (row << 3)
  const x = column * FIELD_SIZE + (FIELD_SIZE >> 1)
  const y = row * FIELD_SIZE + (FIELD_SIZE >> 1)
  const isKing = 'Kk'.includes(code)
  const isWhite = 'MK'.includes(code)

  return (
    <g
      className={isWhite ? css.whitePiece : css.blackPiece}
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
