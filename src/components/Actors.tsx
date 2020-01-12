import React from 'react'
import {createUseStyles} from 'react-jss'
import {TransitionGroup, CSSTransition} from 'react-transition-group'
import {Glyph} from './Glyph'

const useStyles = createUseStyles({
  transitionEnter: {
    opacity: 0.1
  },

  transitionEnterActive: {
    opacity: 1,
    transition: 'opacity ease-out .3s'
  },

  transitionExit: {
    opacity: 1
  },

  transitionExitActive: {
    opacity: 0.1,
    transition: 'opacity .7s ease-in .3s'
  },
})

interface ActorsProps {
  board: Array<number | null>,
  pieces: string[],
  // selection: number | undefined,
  hero: number | null,
  onClick: (i: number) => void
}

export function Actors(props: ActorsProps) {
  const {board, pieces, hero, onClick} = props
  const classes = useStyles()

  const res = pieces
    .map((code, i) => {
      if (code === '') return
      const square = board.indexOf(i)
      return (
        <CSSTransition
          key={`glyph${i}`}
          timeout={1000}
          classNames={{
            enter: classes.transitionEnter,
            enterActive: classes.transitionEnterActive,
            exit: classes.transitionExit,
            exitActive: classes.transitionExitActive
          }}>

          <Glyph
            id={i}
            code={code}
            square={square}
            selected={i === hero}
            onClick={() => onClick(i)}
          />
        </CSSTransition>
      )
    })

  if (hero) {
    return <TransitionGroup component={null}>
      {[...res.slice(0, hero), ...res.slice(hero + 1), res[hero]]}
    </TransitionGroup>
  } else {
    return <TransitionGroup component={null}>
      {[...res]}
    </TransitionGroup>
  }
}