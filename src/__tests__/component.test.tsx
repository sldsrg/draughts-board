import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {act} from 'react-dom/test-utils'
import {render, fireEvent, cleanup, RenderResult, prettyDOM} from '@testing-library/react'

import {Board} from '../index'
import {centerOf, c3, e3, d4, e5} from './utils/namedSquares'

jest.useFakeTimers()
afterEach(cleanup)

function runAllTimers() {
  jest.runAllTimers()
}

describe('Board component', () => {

  describe('wen rendered with undefined position property', () => {
    it('setup initial position', () => {
      const rr = render(<Board />)
      expect(rr.queryAllByRole('white-man')).toHaveLength(12)
      expect(rr.queryAllByRole('black-man')).toHaveLength(12)
    })
  })

  describe('wen rendered with specified position', () => {
    it('setup correct one', () => {
      const rr = render(<Board position='e5, f6 g7' />)
      expect(rr.queryAllByRole('white-man')).toHaveLength(1)
      expect(rr.queryAllByRole('black-man')).toHaveLength(2)
    })
  })

  describe('without previously selected piece', () => {
    let rr: RenderResult

    beforeEach(() => {
      rr = render(<Board />)
    })

    it('keep selection undefined when clicked on empty square', () => {
      act(() => {
        fireEvent.click(rr.getByRole('d4'))
      })
      expect(rr.queryByRole('highlight')).toBeNull()
    })

    it('keep selection undefined when clicked on piece with wrong color', () => {
      act(() => {
        fireEvent.click(rr.getByRole('b6'))
      })
      expect(rr.queryByRole('highlight')).toBeNull()
    })

    it('proclaimed as hero when clicked on piece with right color', () => {
      act(() => {
        fireEvent.click(rr.getByRole('c3'))
      })
      const hero = rr.getByRole('highlight').parentElement as HTMLElement
      const {x, y} = centerOf(c3)
      const style = window.getComputedStyle(hero)
      expect(style.transform).toBe(`translate(${x}px,${y}px)`)
    })
  })

  describe('with selected piece', () => {
    it('change selection when clicked on another piece that can move', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('e3')) // select another
      })
      const hero = rr.getByRole('highlight').parentElement as HTMLElement
      const {x, y} = centerOf(e3)
      const style = window.getComputedStyle(hero)
      expect(style.transform).toBe(`translate(${x}px,${y}px)`)
    })

    it('do not change selection when clicked on piece with another color', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('b6')) // ignore
      })
      const hero = rr.getByRole('highlight').parentElement as HTMLElement
      const {x, y} = centerOf(c3)
      const style = window.getComputedStyle(hero)
      expect(style.transform).toBe(`translate(${x}px,${y}px)`)
    })

    it('do not change selection when move to clicked square is illegal', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('c5')) // ignore
      })
      const hero = rr.getByRole('highlight').parentElement as HTMLElement
      const {x, y} = centerOf(c3)
      const style = window.getComputedStyle(hero)
      expect(style.transform).toBe(`translate(${x}px,${y}px)`)
    })

    it('make move and clear selection when move to clicked square is legal', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('d4')) // make move
      })
      expect(rr.queryByRole('highlight')).toBeNull()
      const piece = rr.getByTestId('piece13')
      const style = window.getComputedStyle(piece)
      const {x, y} = centerOf(d4)
      expect(style.transform).toBe(`translate(${x}px,${y}px)`)
    })

    describe('callback "onMoveCompleted" invoked with correct notation', () => {
      it(' after quiet move', () => {
        const onCompleted = jest.fn()
        const rr = render(<Board onMoveCompleted={onCompleted} />)
        act(() => {
          fireEvent.click(rr.getByRole('c3')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('d4')) // make move
          jest.runAllTimers()
        })
        expect(onCompleted).toBeCalledWith('c3-d4')
      })

      it('after single capture move', () => {
        const onCompleted = jest.fn()
        const rr = render(<Board position='c3, d4 h6' onMoveCompleted={onCompleted} />)
        act(() => {
          fireEvent.click(rr.getByRole('c3')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('e5')) // make move
          jest.runAllTimers()
        })
        expect(onCompleted).toBeCalledWith('c3:e5')
      })

      it('after double capture move', () => {
        const onCompleted = jest.fn()
        const rr = render(<Board position='c3, d4 f6' onMoveCompleted={onCompleted} />)
        act(() => {
          fireEvent.click(rr.getByRole('c3')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('e5')) // make move
          jest.runAllTimers()
        })
        act(() => {
          fireEvent.click(rr.getByRole('g7')) // make move
          jest.runAllTimers()
        })
        expect(onCompleted).toBeCalledWith('c3:e5:g7')
      })

      it('removes captured piece if there is one', () => {
        const rr = render(<Board position='e5, f6 h6' />)
        expect(rr.queryByTestId('piece1')).not.toBeNull()
        act(() => {
          fireEvent.click(rr.getByRole('e5')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('g7')) // make move
          jest.runAllTimers()
        })
        expect(rr.queryByTestId('piece1')).toBeNull()
      })

      it('moves selection if capture continuation available', () => {
        const rr = render(<Board position='c3, d4 f6' />)
        act(() => {
          fireEvent.click(rr.getByRole('c3')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('e5')) // make move
          jest.runAllTimers()
        })
        const hero = rr.getByRole('highlight').parentElement as HTMLElement
        const {x, y} = centerOf(e5)
        const style = window.getComputedStyle(hero)
        expect(style.transform).toBe(`translate(${x}px,${y}px)`)
      })

      it('clears selection if capture continuation finished', () => {
        const rr = render(<Board position='c1 h6, d2 f4 g7 h4' />)
        act(() => {
          fireEvent.click(rr.getByRole('c1')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('e3')) // first capture
        })
        expect(rr.queryByRole('highlight')).toBeDefined()
        act(() => {
          fireEvent.click(rr.getByRole('g5')) // last capture
        })
        expect(rr.queryByRole('highlight')).toBeNull()
      })

      it('promote white man to king on the topmost row', () => {
        const rr = render(<Board position='c7, d2' />)
        act(() => {
          fireEvent.click(rr.getByRole('c7')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('d8')) // make move
        })
        expect(rr.queryByTestId('piece0')).toHaveAttribute('role', 'white-king')
      })

      it('promote black man to king on the lowest row', () => {
        const rr = render(<Board position='c7, d2 blacks turn' />)
        act(() => {
          fireEvent.click(rr.getByRole('d2')) // select piece
        })
        act(() => {
          fireEvent.click(rr.getByRole('e1')) // make move
        })
        expect(rr.queryByTestId('piece1')).toHaveAttribute('role', 'black-king')
      })
    })

    describe('property "moves"', () => {
      describe('with initial position (i.e. "position" property undefined)', () => {

        it('properly changes position when passed single move', () => {
          const rr = render(<Board moves={['e3-d4']} />)
          act(runAllTimers)
          const piece = rr.getByTestId('piece14')
          const {x, y} = centerOf(d4)
          const style = window.getComputedStyle(piece)
          expect(style.transform).toBe(`translate(${x}px,${y}px)`)
        })

        it('properly changes position when passed two moves', () => {
          const rr = render(<Board moves={['e3-d4', 'd6-e5']} />)
          act(runAllTimers)
          const piece9 = rr.getByTestId('piece9')
          const piece14 = rr.getByTestId('piece14')
          const {x: x9, y: y9} = centerOf(e5)
          const {x: x14, y: y14} = centerOf(d4)
          const style9 = window.getComputedStyle(piece9)
          expect(style9.transform).toBe(`translate(${x9}px,${y9}px)`)
          const style14 = window.getComputedStyle(piece14)
          expect(style14.transform).toBe(`translate(${x14}px,${y14}px)`)
        })

        it('moves with capture change material balance', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(runAllTimers)
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
        })

        it('respects previously played moves', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5']} />)
          act(runAllTimers)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(runAllTimers)
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
        })

        it('properly handles multi-capture move', () => {
          const rr = render(<Board moves={['e3-d4', 'b6-a5', 'c3-b4', 'a5:c3:e5']} />)
          act(runAllTimers)
          expect(rr.queryAllByRole('white-man')).toHaveLength(10)
          expect(rr.queryAllByRole('black-man')).toHaveLength(12)
        })

        it('roll back on partial moves removal', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(runAllTimers)
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5']} />)
          act(runAllTimers)
          expect(rr.queryAllByRole('white-man')).toHaveLength(12)
          expect(rr.queryAllByRole('black-man')).toHaveLength(12)
        })

        it('roll back to initial position on all moves removal', () => {
          const rr = render(<Board moves={[]} />)
          act(runAllTimers)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(runAllTimers)
          rr.rerender(<Board moves={[]} />)
          act(runAllTimers)
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })

        it('properly handles rollback with multi-capture move', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-g5', 'e3-f4']} />)
          act(runAllTimers)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board moves={['c3-d4', 'f6-g5', 'e3-f4', 'g5:e3:c5']} />)
          act(runAllTimers)
          rr.rerender(<Board moves={['c3-d4', 'f6-g5', 'e3-f4']} />)
          act(runAllTimers)
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })

        it('roll back from state with selected piece', () => {
          const rr = render(<Board moves={[]} />)
          act(runAllTimers)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
            fireEvent.click(rr.getByRole('d2')) // select piece
          })
          rr.rerender(<Board moves={[]} />)
          act(runAllTimers)
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })
      })

      describe('with specified position', () => {
        it('properly changes position when passed single move', () => {
          const rr = render(<Board position='c3, b6' moves={['c3-d4']} />)
          act(runAllTimers)
          const piece = rr.getByTestId('piece0')
          const {x, y} = centerOf(d4)
          const style = window.getComputedStyle(piece)
          expect(style.transform).toBe(`translate(${x}px,${y}px)`)
        })

        it('roll back to specified position on all moves removal', () => {
          const rr = render(<Board position='c3, b6' moves={[]} />)
          act(runAllTimers)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board position='c3, b6' moves={['c3-d4', 'b6-e5', 'd4:f6']} />)
          act(runAllTimers)
          rr.rerender(<Board position='c3, b6' moves={[]} />)
          act(runAllTimers)
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })

        it('properly handles rollback with multi-capture move', () => {
          const rr = render(<Board position='c1, f4 g5 h8' moves={['c1-d2', 'f4-e3']} />)
          act(runAllTimers)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board position='c1, f4 g5 h8' moves={['c1-d2', 'f4-e3', 'd2:f4:h6']} />)
          act(runAllTimers)
          rr.rerender(<Board position='c1, f4 g5 h8' moves={['c1-d2', 'f4-e3']} />)
          act(runAllTimers)
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })

        it('promotes white man to king on topmost square', () => {
          const rr = render(<Board position='c7, f4' moves={['c7-d8']} />)
          act(runAllTimers)
          const subject = rr.queryByRole('white-king')
          expect(subject).not.toBeNull()
        })

        it('promotes black man to king on lowest square', () => {
          const rr = render(<Board position='c5, f2 blacks turn' moves={['f2-e1']} />)
          act(runAllTimers)
          const subject = rr.queryByRole('black-king')
          expect(subject).not.toBeNull()
        })
      })
    })
  })
})
