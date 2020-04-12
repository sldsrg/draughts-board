import React from 'react'
import { BOARD_SIZE, FIELD_SIZE, MARGIN } from '../constants'

interface SceneProps {
  onClick: (i: number) => void
}

export function Scene(props: SceneProps) {
  return <g>
    <rect
      x={-(MARGIN + 4) >> 1}
      y={-(MARGIN + 4) >> 1}
      width={BOARD_SIZE + MARGIN + 4}
      height={BOARD_SIZE + MARGIN + 4}
      fill='transparent'
      stroke='#ffffff77'
      strokeWidth={MARGIN - 2}
    />
    {...Array(64)
      .fill(null)
      .map((_, i) => {
        const row = i >> 3
        const column = i % 8
        const role = 'abcdefgh'.charAt(column) + (8 - row).toString()
        return (
          <rect
            key={i} role={role}
            x={column * FIELD_SIZE}
            y={row * FIELD_SIZE}
            width={FIELD_SIZE}
            height={FIELD_SIZE}
            fill={row % 2 === column % 2 ? '#ffffff77' : '#00000000'}
            onClick={() => props.onClick(i)}
          />)
      })
    }
  </g>
}
