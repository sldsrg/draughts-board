import { FIELD_SIZE } from '../../constants'

// convenience constants and functions for testing

export const b8 = 1
export const d8 = 3
export const f8 = 5
export const h8 = 7

export const a7 = 8
export const c7 = 10
export const e7 = 12
export const g7 = 14

export const b6 = 17
export const d6 = 19
export const f6 = 21
export const h6 = 23

export const a5 = 24
export const c5 = 26
export const e5 = 28
export const g5 = 30

export const b4 = 33
export const d4 = 35
export const f4 = 37
export const h4 = 39

export const a3 = 40
export const c3 = 42
export const e3 = 44
export const g3 = 46

export const b2 = 49
export const d2 = 51
export const f2 = 53
export const h2 = 55

export const a1 = 56
export const c1 = 58
export const e1 = 60
export const g1 = 62

export function centerOf(square: number) {
  const row = square >> 3
  const column = square - (row << 3)
  return {
    x: FIELD_SIZE * column + (FIELD_SIZE >> 1),
    y: FIELD_SIZE * row + (FIELD_SIZE >> 1)
  }
}
