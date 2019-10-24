import React, { useState, useCallback } from 'react'
import { WhiteMan, BlackMan } from './pieces'
import { array } from 'prop-types'

const FIELD_SIZE = 80
const BOARD_SIZE = FIELD_SIZE << 3
const MARGIN = 24

interface IProps {
  background?: string
}

export function Board(props: IProps) {
  const [selected, setSelected] = useState()

  const handleClick = useCallback((event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const { left, top, width } = event.currentTarget.getBoundingClientRect()
    const scale = (BOARD_SIZE + MARGIN + MARGIN) / (width - left)
    const x = (event.clientX - left) * scale - MARGIN
    const y = (event.clientY - top) * scale - MARGIN
    if (0 > x || x > BOARD_SIZE || 0 > y || y > BOARD_SIZE) return
    const column = Math.floor(x / FIELD_SIZE)
    const row = Math.floor(y / FIELD_SIZE)
    if (column % 2 !== row % 2) {
      setSelected({ row, column })
      console.log(`column:${column} row:${row}`)
    }
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
        {selected && (
          <rect
            x={selected.column * FIELD_SIZE + 1}
            y={selected.row * FIELD_SIZE + 1}
            width={FIELD_SIZE - 2}
            height={FIELD_SIZE - 2}
            fill='transparent'
            stroke='yellow'
            strokeWidth={2}
          />
        )}
        <BlackMan row={1} column={0} />
        <BlackMan row={0} column={1} />
        <WhiteMan row={7} column={0} />
        <WhiteMan row={6} column={1} />
      </svg>
    </div>
  )
}
