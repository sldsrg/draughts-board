import React, {useReducer, useEffect, useRef, useState} from 'react'
import {BOARD_SIZE, FIELD_SIZE, MARGIN} from './constants'
import {reducer, INITIAL_STATE} from './reducer'
import {Definitions, Glyph} from './glyph'
import {parseMove, setUp} from './tools'
import {Field} from './field'

type MoveCallback = (notation: string) => void

interface Props {
  background?: string,
  position?: string,
  moves?: string[],
  onMoveCompleted?: MoveCallback
}

interface LogRecord {
  board: Array<number | null>,
  pieces: string[]
}

type Job =
  {type: 'play', data: string} |
  {type: 'undo', snapshots: LogRecord[]}

export function Board(props: Props) {
  const {background, position: initialPosition, moves, onMoveCompleted} = props
  const [{board, pieces, stage, notation}, dispatch] = useReducer(reducer, INITIAL_STATE)
  const [selection, setSelection] = useState<number | undefined>()
  const [whitesTurn, setWhitesTurn] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const history = useRef<Array<{notation: string, steps: LogRecord[]}>>([])
  const moveNumber = useRef(-1)

  useEffect(() => {
    if (initialPosition) {
      const {whitesTurn} = setUp(initialPosition)
      setWhitesTurn(whitesTurn)
    }
    dispatch({type: 'init', position: initialPosition})
  }, [initialPosition])

  useEffect(() => {
    if (stage === 'pending') {
      if (onMoveCompleted) {
        onMoveCompleted(notation)
      }
      dispatch({type: 'reset'})
      history.current[moveNumber.current].notation = notation
      setSelection(undefined)
      setWhitesTurn(val => !val)
    }
  }, [onMoveCompleted, stage, notation])

  useEffect(() => {
    if (moves === undefined) return // uncontrolled mode - do nothing
    if (moves.length > history.current.length) {
      // play passed to component moves
      const newJobs: Job[] = moves
        .slice(history.current.length)
        .map(move => ({type: 'play', data: move}))
      setJobs(prev => [...prev, ...newJobs])
    } else if (moves.length < history.current.length) {
      // undo played moves to match passed to component
      const newJobs: Job[] = history.current
        .slice(moves.length)
        .reverse()
        .map(h => ({type: 'undo', snapshots: h.steps}))
      setJobs(prev => [...prev, ...newJobs])
    }
  }, [moves])

  useEffect(() => {
    if (jobs.length === 0) return
    const job = jobs[0]
    switch (job.type) {
      case 'play':
        {
          const from = Field.parse(job.data.substr(0, 2))
          const to = Field.parse(job.data.substr(3, 2))
          const actions = parseMove(board, pieces, from, to)
          moveNumber.current++
          history.current[moveNumber.current] = {notation: job.data, steps: []}
          if (actions) {
            actions.map(x => dispatch(x))
          }
        }
        setJobs(prev => prev.slice(1))
        break
    }
  }, [board, initialPosition, jobs, pieces])

  useEffect(() => {
    if (jobs.length === 0) return
    const job = jobs[0]
    switch (job.type) {
      case 'undo':
        history.current = history.current.slice(0, moveNumber.current)
        moveNumber.current--
        if (moveNumber.current >= 0)
          dispatch({type: 'restore', with: history.current[moveNumber.current].steps[0]})
        else
          dispatch({type: 'init', position: initialPosition})
        setTimeout(() => setJobs(prev => prev.slice(1)), 700)
    }
  }, [initialPosition, jobs])

  useEffect(() => {
    if (moveNumber.current >= 0) {
      history.current[moveNumber.current].steps[0] = {board: [...board], pieces: [...pieces]}
    }
  }, [board, pieces])

  const pieceClicked = (piece: number) => {
    const square = board.findIndex(s => s === piece)
    squareClicked(square)
  }

  const squareClicked = (target: number) => {
    const pieceIndex = board[target]
    if (selection !== undefined) {
      if (pieceIndex !== null) { // keep or move selection
        if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
          dispatch({type: 'select', sqaure: target})
          setSelection(target)
        }
      } else {
        const actions = parseMove(board, pieces, selection, target)
        if (actions !== null) {
          // update position according to move
          actions.forEach(action => dispatch(action))
          if ( // check on man-to-king promotion
            'Mm'.includes(pieces[board[selection] as number]) &&
            (whitesTurn && target < 8 || !whitesTurn && target > 54)
          ) {
            dispatch({type: 'convert', at: target})
          }
          if (actions.some(a => a.type === 'remove'))
            dispatch({type: 'chop', sqaure: target})
          else
            dispatch({type: 'hoop', sqaure: target})
          setSelection(target)
          // dispatch({type: 'advance'})
        }
      }
    } else { // select piece - new move started
      if (pieceIndex !== null) {
        if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
          moveNumber.current++
          history.current[moveNumber.current] = {notation: '', steps: []}
          dispatch({type: 'select', sqaure: target})
          setSelection(target)
        }
      }
    }
  }

  const squares = Array(64)
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
          onClick={() => squareClicked(i)}
        />)
    })

  const glyphs = pieces
    .map((code, i) => {
      if (code === '') return
      const square = board.indexOf(i)
      return (
        <Glyph
          key={`piece${i}`}
          id={i}
          code={code}
          square={square}
          selected={selection === square}
          onClick={() => pieceClicked(i)}
        />
      )
    })

  return (
    <div>
      <h1>Draughts Board</h1>
      <svg
        viewBox={`${-MARGIN} ${-MARGIN} ${BOARD_SIZE + MARGIN + MARGIN} ${BOARD_SIZE +
          MARGIN +
          MARGIN}`}
        style={{
          backgroundColor: 'brown',
          backgroundImage: `url(${background})`
        }}
      >
        <Definitions />
        <rect
          x={-(MARGIN + 4) >> 1}
          y={-(MARGIN + 4) >> 1}
          width={BOARD_SIZE + MARGIN + 4}
          height={BOARD_SIZE + MARGIN + 4}
          fill='transparent'
          stroke='#ffffff77'
          strokeWidth={MARGIN - 2}
        />
        {...squares}
        {...glyphs}
      </svg>
    </div>
  )
}
