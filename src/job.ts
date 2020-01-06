export interface StepRecord {
  board: Array<number | null>,
  pieces: string[]
}

export type Job =
  {type: 'play', data: string} |
  {type: 'undo', snapshot: StepRecord} |
  {type: 'turn', forwards: boolean}

export function moveToJobs(move: String): Job[] {
  if (move.length < 6) {
    return [
      {type: 'play', data: move} as Job,
      {type: 'turn', forwards: true} as Job
    ]
  } else {
    return [
      ...move.split(':')
        .reduce((acc, cur) => `${acc}:${cur},${cur}`)
        .split(',')
        .slice(0, -1)
        .map(x => ({type: 'play', data: x} as Job)),
      {type: 'turn', forwards: true} as Job
    ]
  }
}