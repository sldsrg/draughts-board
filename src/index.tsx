import React, { useState, useCallback } from 'react'
import { Position } from './position'
import { Glyph } from './piece'

const FIELD_SIZE = 80
const BOARD_SIZE = FIELD_SIZE << 3
const MARGIN = 24

interface IProps {
  background?: string
}

export function Board(props: IProps) {
  const [selection, setSelection] = useState()
  const [pieces, setPieces] = useState(new Position(Position.INITIAL).pieces)

  const handleClick = useCallback(
    (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      const { left, top, width } = event.currentTarget.getBoundingClientRect()
      const scale = (BOARD_SIZE + MARGIN + MARGIN) / (width - left)
      const x = (event.clientX - left) * scale - MARGIN
      const y = (event.clientY - top) * scale - MARGIN
      if (0 > x || x > BOARD_SIZE || 0 > y || y > BOARD_SIZE) return
      const column: number = Math.floor(x / FIELD_SIZE)
      const row: number = Math.floor(y / FIELD_SIZE)
      if (column % 2 !== row % 2) {
        if (selection) {
          // TODO: prevent rules violation
          const i = pieces.findIndex(
            (piece) => piece.row === selection.row && piece.column === selection.column
          )
          if (i >= 0) {
            const piece = pieces[i]
            piece.row = row
            piece.column = column
            setPieces(pieces)
          }
          setSelection(null)
        } else {
          const i = pieces.findIndex((piece) => piece.row === row && piece.column === column)
          if (i >= 0) {
            // TODO: check turn move
            const piece = pieces[i]
            setPieces([...pieces.slice(0, i), ...pieces.slice(i + 1), piece]) // z-index workaround
            setSelection({ row, column })
          }
        }
      }
    },
    [selection, pieces]
  )

  const whiteSquares = Array(16)
    .fill(null)
    .flatMap((_, i) => {
      const row = (i >> 2) << 1
      const column = i % 4 << 1
      return [
        <rect
          key={i}
          x={column * FIELD_SIZE}
          y={row * FIELD_SIZE}
          width={FIELD_SIZE}
          height={FIELD_SIZE}
          fill='#ffffff77'
        />,
        <rect
          key={i + 16}
          x={(column + 1) * FIELD_SIZE}
          y={(row + 1) * FIELD_SIZE}
          width={FIELD_SIZE}
          height={FIELD_SIZE}
          fill='#ffffff77'
        />
      ]
    })

  return (
    <div>
      <h1>Draughts Board</h1>
      <svg
        viewBox={`${-MARGIN} ${-MARGIN} ${BOARD_SIZE + MARGIN + MARGIN} ${BOARD_SIZE +
          MARGIN +
          MARGIN}`}
        style={{ backgroundImage: `url(${props.background})` }}
        onClick={handleClick}
      >
        <rect
          x={-(MARGIN + 4) >> 1}
          y={-(MARGIN + 4) >> 1}
          width={BOARD_SIZE + MARGIN + 4}
          height={BOARD_SIZE + MARGIN + 4}
          fill='transparent'
          stroke='#ffffff77'
          strokeWidth={MARGIN - 2}
        />
        {...whiteSquares}
        {selection && (
          <rect
            x={selection.column * FIELD_SIZE + 1}
            y={selection.row * FIELD_SIZE + 1}
            width={FIELD_SIZE - 2}
            height={FIELD_SIZE - 2}
            fill='transparent'
            stroke='yellow'
            strokeWidth={2}
          />
        )}
        {pieces.map((piece) => (
          <Glyph key={piece.key} piece={piece} />
        ))}
      </svg>
    </div>
  )
}
