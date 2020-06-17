import React from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { Glyph } from './Glyph'
import css from './Actors.css'

interface ActorsProps {
  board: Array<number | null>,
  pieces: string[],
  hero: number | null,
  onClick: (id: number) => void
}

export function Actors(props: ActorsProps) {
  const { board, pieces, hero, onClick } = props

  return <TransitionGroup component={null}>
    {[
      ...pieces
        .map((code, index) => ({ code, id: index }))
        .filter(({ code, id }) => code !== '' && id !== hero)
        .map(({ code, id }) => {
          return (
            <CSSTransition
              key={`glyph${id}`}
              timeout={1000}
              classNames={{
                enter: css.transitionEnter,
                enterActive: css.transitionEnterActive,
                exit: css.transitionExit,
                exitActive: css.transitionExitActive
              }}>

              <Glyph
                id={id}
                code={code}
                square={board.indexOf(id)}
                selected={false}
                onClick={() => onClick(id)}
              />
            </CSSTransition>
          )
        }),

      hero !== null && (
        <CSSTransition
          key={`glyph${hero}`}
          timeout={1000}
          classNames={{
            enter: css.transitionEnter,
            enterActive: css.transitionEnterActive,
            exit: css.transitionExit,
            exitActive: css.transitionExitActive
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
