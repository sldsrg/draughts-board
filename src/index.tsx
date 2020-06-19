import React, { useReducer, useEffect, useRef, useState } from 'react'
import { BOARD_SIZE, MARGIN } from './constants'
import { reducer, INITIAL_STATE } from './reducer'
import { Definitions } from './components/Definitions'
import { Scene } from './components/Scene'
import { Actors } from './components/Actors'
import { parseMove, setUp, newGame, snapshot } from './tools'
import { Field } from './field'
import { Job, moveToJobs, StepRecord } from './job'

type MoveCallback = (notation: string) => void
type SetupCallback = (position: string) => void

interface Props {
  mode?: 'setup' | 'play',
  background?: string,
  position?: string,
  onSetupCompleted?: SetupCallback,
  moves?: string[],
  onMoveCompleted?: MoveCallback
}

export function Board(props: Props): JSX.Element {
  const {
    mode = 'play',
    background, // TODO: default background
    position: initialPosition,
    // for 'setup' mode
    onSetupCompleted: onSetupPosition,
    // for 'play' mode
    moves,
    onMoveCompleted
  } = props
  const [{ board, pieces, stage, notation }, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [hero, setHero] = useState<number | null>(null)
  const [whitesTurn, setWhitesTurn] = useState(true)
  const [queue, setQueue] = useState<Array<Job>>([])
  const [job, setJob] = useState<Job>()
  const [inventory, setInventory] = useState<'m' | 'k' | 'M' | 'K'>('M')
  const history = useRef<Array<{ notation: string, steps: StepRecord[] }>>([
    { notation: '', steps: [] }
  ])
  const moveNumber = useRef(0)

  useEffect(() => {
    if (queue.length === 0) return
    const job = queue[0]
    setJob(job)
    const timer = setTimeout(() => setQueue(q => q.slice(1)), job.delay)
    return () => clearTimeout(timer)
  }, [queue])

  useEffect(
    () => {
      if (!job) return
      const record = history.current[moveNumber.current]
      switch (job.type) {
        case 'proclaim':
          setHero(board[Field.parse(job.hero)])
          break
        case 'play':
          parseMove(board, pieces,
            Field.parse(job.data.substr(0, 2)),
            Field.parse(job.data.substr(3, 2))
          )?.map(x => dispatch(x))
          record.notation = (record.notation?.length)
            ? `${record.notation}${job.data.slice(2)}`
            : job.data
          record.steps.push({ board: [...board], pieces: [...pieces] })
          break
        case 'undo':
          dispatch({ type: 'restore', with: job.snapshot })
          break
        case 'turn':
          setHero(null)
          moveNumber.current += job.forwards ? 1 : -1
          history.current[moveNumber.current] = { notation: '', steps: [] }
          setWhitesTurn(turn => !turn)
          break
      }
      setJob(undefined)
    }, [job, board, pieces, whitesTurn])

  useEffect(() => {
    if (initialPosition) {
      const { whitesTurn, board, pieces } = setUp(initialPosition)
      setWhitesTurn(whitesTurn)
      dispatch({ type: 'restore', with: { board, pieces } })
    } else {
      setWhitesTurn(true)
      dispatch({ type: 'restore', with: newGame() })
    }
  }, [initialPosition])

  useEffect(() => {
    if (stage === 'pending') {
      if (onMoveCompleted) {
        onMoveCompleted(notation)
      }
      dispatch({ type: 'reset' })
      history.current[moveNumber.current].notation = notation
      moveNumber.current++
      setHero(null)
      setWhitesTurn(val => !val)
    }
  }, [onMoveCompleted, stage, notation])

  useEffect(() => {
    if (moves === undefined) return // uncontrolled mode - do nothing
    if (moves.length - moveNumber.current > 0) {
      // play passed to component moves
      setQueue(q => [...q,
      ...moves
        .slice(moveNumber.current)
        .flatMap(move => moveToJobs(move))
      ])
    } else if (moves.length - moveNumber.current < 0) {
      // undo played moves to match passed to component
      setQueue(q => [...q,
      ...history.current.slice(moves.length, moveNumber.current)
        .reverse()
        .flatMap(({ notation, steps }) => [
          { type: 'proclaim', hero: notation.slice(notation.length - 2), delay: 50 } as Job,
          ...steps.reverse().map(step => (
            { type: 'undo', snapshot: step, delay: 500 } as Job)
          ),
          { type: 'turn', forwards: false, delay: 0 } as Job
        ])
      ])
    }
  }, [moves])

  const pieceClicked = (piece: number) => {
    const square = board.findIndex(s => s === piece)
    squareClicked(square)
  }

  const squareClicked = (target: number) => {
    if (mode === 'play') {
      const pieceIndex = board[target]
      if (hero !== null) {
        if (pieceIndex !== null) { // keep or move selection
          if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
            dispatch({ type: 'select', square: target })
            setHero(pieceIndex)
          }
        } else {
          const actions = parseMove(board, pieces, board.indexOf(hero), target)
          if (actions !== null) {
            // save previous position
            history.current[moveNumber.current].steps.push({
              board: [...board],
              pieces: [...pieces]
            })
            // update position according to move
            actions.forEach(action => dispatch(action))
            if (actions.some(a => a.type === 'remove')) {
              setTimeout(() => dispatch({ type: 'chop', square: target }), 1000)
              // dispatch({type: 'chop', square: target})
            } else {
              setTimeout(() => dispatch({ type: 'hoop', square: target }), 1000)
              // dispatch({type: 'hoop', square: target})
            }
          }
        }
      } else { // select piece
        if (pieceIndex !== null) {
          if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
            history.current[moveNumber.current] = { notation: '', steps: [] }
            dispatch({ type: 'select', square: target })
            setHero(board[target])
          }
        }
      }
    } else {
      // setup position
      dispatch({ type: 'place', to: target, code: inventory })
    }
  }


  const size = BOARD_SIZE + MARGIN + MARGIN
  return (
    <div>
      <h2>{whitesTurn ? 'whites' : 'blacks'} to move</h2>
      <svg
        viewBox={`${-MARGIN} ${-MARGIN} ${size} ${size}`}
        style={{
          backgroundColor: 'brown',
          backgroundImage: `url(${background})`
        }}
      >
        <Definitions />
        <Scene onClick={i => squareClicked(i)} />
        <Actors onClick={i => pieceClicked(i)}
          board={board}
          pieces={pieces}
          hero={hero} />
      </svg>
      {mode === 'setup' &&
        <>
          <button onClick={() => setInventory('M')}>White Man</button>
          <button onClick={() => setInventory('K')}>White King</button>
          <button onClick={() => setInventory('m')}>Black Man</button>
          <button onClick={() => setInventory('k')}>Black King</button>
          <button onClick={() => dispatch(
            {
              type: 'restore',
              with: {
                board: Array(64).fill(null),
                pieces: Array(24).fill('')
              }
            })}>
            Clear
          </button>
          <button onClick={() => dispatch({ type: 'restore', with: newGame() })}>
            Init
          </button>
          {onSetupPosition &&
            <button onClick={() => onSetupPosition(snapshot(board, pieces, whitesTurn))}>
              Save
            </button>
          }
        </>
      }
    </div >
  )
}
