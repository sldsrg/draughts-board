import { Inventory } from './reducer'

export interface StepRecord {
  board: Array<number | null>,
  pieces: Inventory
}

export type Job =
  { type: 'proclaim', hero: string, delay: number } |
  { type: 'play', data: string, delay: number } |
  { type: 'undo', snapshot: StepRecord, delay: number } |
  { type: 'turn', forwards: boolean, delay: number }

export function moveToJobs(move: string): Job[] {
  const hero = move.slice(0, 2)
  if (move.length < 6) {
    return [
      { type: 'proclaim', hero: hero, delay: 50 },
      { type: 'play', data: move, delay: 700 } as Job,
      { type: 'turn', forwards: true, delay: 0 } as Job
    ]
  } else {
    return [
      { type: 'proclaim', hero: hero, delay: 50 },
      ...move.split(':')
        .reduce((acc, cur) => `${acc}:${cur},${cur}`)
        .split(',')
        .slice(0, -1)
        .map(x => ({ type: 'play', data: x, delay: 700 } as Job)),
      { type: 'turn', forwards: true, delay: 0 } as Job
    ]
  }
}
