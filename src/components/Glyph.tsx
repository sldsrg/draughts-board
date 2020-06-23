import React from 'react'
import { FIELD_SIZE } from '../constants'

import css from './Glyph.css'
import { isWhite, isMan } from '../tools'

interface GlyphProps {
  id: number,
  code: 'm' | 'k' | 'M' | 'K' | null,
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

  return (
    <g
      className={isWhite(code) ? css.whitePiece : css.blackPiece}
      style={{ transform: `translate(${x}px,${y}px)` }}
      data-testid={`piece${id}`}
      role={`${isWhite(code) ? 'white' : 'black'}-${isMan(code) ? 'man' : 'king'}`}
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
      <use href={isMan(code) ? '#man' : '#king'} onClick={onClick} />
    </g>
  )
}
