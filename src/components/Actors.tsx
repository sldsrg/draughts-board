import React from 'react'
import { createUseStyles } from 'react-jss'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { Glyph } from './Glyph'

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
  hero: number | null,
  onClick: (id: number) => void
}

export function Actors(props: ActorsProps) {
  const { board, pieces, hero, onClick } = props
  const classes = useStyles()

  return <TransitionGroup component={null}>
    {[
      ...pieces
        .map((code, index) => ({ code, id: index }))
        .filter(({ code, id }) => code !== '' && id !== hero)
        .map(({ code, id }) => (
          <CSSTransition
            key={`glyph${id}`}
            timeout={1000}
            classNames={{
              enter: classes.transitionEnter,
              enterActive: classes.transitionEnterActive,
              exit: classes.transitionExit,
              exitActive: classes.transitionExitActive
            }}>

            <Glyph
              id={id}
              code={code}
              square={board.indexOf(id)}
              selected={false}
              onClick={() => onClick(id)}
            />
          </CSSTransition>
        )),

      hero !== null && (
        <CSSTransition
          key={`glyph${hero}`}
          timeout={1000}
          classNames={{
            enter: classes.transitionEnter,
            enterActive: classes.transitionEnterActive,
            exit: classes.transitionExit,
            exitActive: classes.transitionExitActive
          }}>

          <Glyph
            id={hero}
            code={pieces[hero]}
            square={board.indexOf(hero)}
            selected={true}
            onClick={() => onClick(hero)}
          />
        </CSSTransition>
      )
    ]}
  </TransitionGroup>
}
