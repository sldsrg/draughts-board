import React, { useCallback, useReducer } from 'react'
import { reducer, INITIAL_STATE } from './reducer'
import { Glyph } from './piece'

const FIELD_SIZE = 80
const BOARD_SIZE = FIELD_SIZE << 3
const MARGIN = 24

interface IProps {
  background?: string
}

export function Board(props: IProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const handleClick = useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const { left, top, width } = event.currentTarget.getBoundingClientRect()
    const scale = (BOARD_SIZE + MARGIN + MARGIN) / (width - left)
    const x = (event.clientX - left) * scale - MARGIN
    const y = (event.clientY - top) * scale - MARGIN
    if (0 > x || x > BOARD_SIZE || 0 > y || y > BOARD_SIZE) return
    const column: number = Math.floor(x / FIELD_SIZE)
    const row: number = Math.floor(y / FIELD_SIZE)
    dispatch({ type: 'click', payload: { row, column } })
  }, [])

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
        style={
          props.background ?
            { backgroundImage: `url(${props.background})` }
            : { backgroundColor: 'brown' }
        }
        onClick={handleClick}
      >
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
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
        {state.selection && (
          <circle
            cx={state.selection.column * FIELD_SIZE + (FIELD_SIZE >> 1)}
            cy={state.selection.row * FIELD_SIZE + (FIELD_SIZE >> 1)}
            r={(FIELD_SIZE >> 1) - 2}
            fill='transparent'
            stroke='yellow'
            strokeWidth={10}
            filter="url(#blur)"
          />)}
        {state.position.pieces.map(piece => (
          <Glyph key={piece.key} piece={piece} />
        ))}
      </svg>
    </div>
  )
}
