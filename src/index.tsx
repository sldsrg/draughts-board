import React, { Component } from 'react'
import wood from './img/wood.jpg'

export class Board extends Component {
  public render() {
    return (
      <div>
        <h1>Draughts Board</h1>
        <img src={wood} alt='wood' />
      </div>
    )
  }
}
