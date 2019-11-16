import React, {useReducer, useEffect, useRef, useState} from 'react'
import {BOARD_SIZE, FIELD_SIZE, MARGIN} from './constants'
import {getReducer, INITIAL_STATE, IState} from './reducer'
import {Definitions, Glyph} from './glyph'
import {parseMove, shouldCapture} from './tools'
import {Field} from './field'

type MoveCallback = (notation: string) => void

interface IProps {
  background?: string,
  position?: string,
  moves?: string[],
  onMoveCompleted?: MoveCallback
}

export function Board(props: IProps) {
  const {background, position, moves, onMoveCompleted} = props
  const [state, dispatch] = useReducer(getReducer(onMoveCompleted), INITIAL_STATE)
  const [movesToPlay, setMovesToPlay] = useState<string[]>([])
  const stateLog = useRef<IState[]>([])

  useEffect(() => {
    dispatch({type: 'init', position})
  }, [position])

  useEffect(() => {
    if (moves === undefined) {
      dispatch({type: 'init', position})
      stateLog.current = []
      return
    }
    setMovesToPlay(moves
      .filter((move, i) => stateLog.current.some(s => (i + 1) >= (s.belongsToMoveNumber || 1)))
    )

  }, [moves])

  useEffect(() => {
    if (movesToPlay.length === 0) return
    const [move, ...rest] = movesToPlay
    const from = Field.parse(move.substr(0, 2))
    const to = Field.parse(move.substr(3, 2))
    state.selection = from
    const actions = parseMove(state, to)
    if (actions) {
      actions.map(x => dispatch(x))
      dispatch({type: 'advance'})
    }
    setMovesToPlay(rest)
  }, [movesToPlay, state])

  useEffect(() => {
    if (state.belongsToMoveNumber) stateLog.current.push(state)
  }, [state])

  const pieceClicked = (piece: number) => {
    const square = state.board.findIndex(s => s === piece)
    squareClicked(square)
  }

  const squareClicked = (target: number) => {
    const {board, pieces, selection, whitesTurn} = state
    const pieceIndex = board[target]
    if (selection !== undefined) {
      if (pieceIndex !== null) { // keep or move selection
        if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
          dispatch({type: 'select', at: target})
        }
      } else {
        const actions = parseMove(state, target)
        if (actions !== null) { // make move
          actions.forEach(action => dispatch(action))
          if ( // check on man-to-king promotion
            'Mm'.includes(pieces[board[selection] as number]) &&
            (whitesTurn && target < 8 || !whitesTurn && target > 54)
          ) {
            dispatch({type: 'convert', at: target})
          }
          dispatch({type: 'advance'})
        }
      }
    } else { // select piece
      if (pieceIndex !== null) {
        if (whitesTurn === 'MK'.includes(pieces[pieceIndex])) {
          dispatch({type: 'select', at: target})
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

  const glyphs = state.pieces
    .map((code, i) => {
      if (code === '') return
      const square = state.board.indexOf(i)
      return (
        <Glyph
          key={`piece${i}`}
          id={i}
          code={code}
          square={square}
          selected={state.selection === square}
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
        <Definitions/>
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
