import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { CssBaseline, Button, Grid } from '@material-ui/core'
import { Board } from 'draughts-board'
import wood from './assets/wood.jpg'

const useStyles = makeStyles({
  root: {
    padding: '1em'
  }
})

function App() {
  const classes = useStyles()
  const [mode, setMode] = useState('play')
  const [position, setPosition] = useState()
  const [game, setGame] = useState(['c3-d4', 'f6-g5', 'e3-f4', 'g5:e3:c5'])
  const [currentMove, setCurrentMove] = useState(-1)

  const onMove = (notation) => {
    const nextMove = currentMove + 1
    // check for existing in game move
    if (notation !== game[nextMove]) {
      setGame(prev => [...game.slice(0, nextMove), notation])
    }
    setCurrentMove(nextMove)
  }

  const playedMoves = game.slice(0, currentMove + 1)
  return (
    <>
      <CssBaseline />
      <Grid container>
        <Grid item lg={12}>
          <Button onClick={() => setMode(mode => mode === 'play' ? 'setup' : 'play')}>Setup</Button>
        </Grid>
        <Grid item xs={12} sm={8} md={4} className={classes.root}>
          <Board
            mode={mode}
            background={wood}
            position={position}
            onSetupCompleted={pos => {
              setPosition(pos)
              setMode('play')
            }}
            moves={playedMoves}
            onMoveCompleted={onMove} />
        </Grid>
        <Grid item sm={2}>
          <Button variant='outlined' onClick={() => setCurrentMove(-1)}>*</Button>
          {game.map((move, index) =>
            <Button
              variant='outlined'
              key={index}
              onClick={() => setCurrentMove(index)}>{move}
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default App
