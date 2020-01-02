import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {act} from 'react-dom/test-utils'
import {render, fireEvent, cleanup, RenderResult, prettyDOM} from '@testing-library/react'

import {Board} from '../index'
import {centerOf, c3, e3, d4, e5} from './utils/namedSquares'

jest.useFakeTimers()
afterEach(cleanup)

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

    it('append selected class when clicked on piece with right color', () => {
      act(() => {
        fireEvent.click(rr.getByRole('c3'))
      })
      const selector = rr.queryByRole('highlight')
      expect(selector).not.toBeNull()
      const {x, y} = centerOf(c3)
      expect(selector).toHaveAttribute('cx', x.toString())
      expect(selector).toHaveAttribute('cy', y.toString())
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
      const selector = rr.queryByRole('highlight')
      const {x, y} = centerOf(e3)
      expect(selector).toHaveAttribute('cx', x.toString())
      expect(selector).toHaveAttribute('cy', y.toString())
    })

    it('do not change selection when clicked on piece with another color', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('b6')) // ignore
      })
      const selector = rr.queryByRole('highlight')
      const {x, y} = centerOf(c3)
      expect(selector).toHaveAttribute('cx', x.toString())
      expect(selector).toHaveAttribute('cy', y.toString())
    })

    it('do not change selection when move to clicked square is illegal', () => {
      const rr = render(<Board />)
      act(() => {
        fireEvent.click(rr.getByRole('c3')) // select piece
      })
      act(() => {
        fireEvent.click(rr.getByRole('c5')) // ignore
      })
      const selector = rr.queryByRole('highlight')
      const {x, y} = centerOf(c3)
      expect(selector).toHaveAttribute('cx', x.toString())
      expect(selector).toHaveAttribute('cy', y.toString())
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
      const {x, y} = centerOf(d4)
      expect(piece).toHaveAttribute('x', x.toString())
      expect(piece).toHaveAttribute('y', y.toString())
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
        })
        act(() => {
          fireEvent.click(rr.getByRole('g7')) // make move
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
        })
        const selector = rr.queryByRole('highlight')
        const {x, y} = centerOf(e5)
        expect(selector).toHaveAttribute('cx', x.toString())
        expect(selector).toHaveAttribute('cy', y.toString())
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
          act(() => {
            jest.runAllTimers()
          })
          const piece = rr.queryByTestId('piece14')
          const {x, y} = centerOf(d4)
          expect(piece).toHaveAttribute('x', x.toString())
          expect(piece).toHaveAttribute('y', y.toString())
        })

        it('properly changes position when passed two moves', () => {
          const rr = render(<Board moves={['e3-d4', 'd6-e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          const piece9 = rr.queryByTestId('piece9')
          const piece14 = rr.queryByTestId('piece14')
          const pos9 = centerOf(e5)
          const pos14 = centerOf(d4)
          expect(piece9).toHaveAttribute('x', pos9.x.toString())
          expect(piece9).toHaveAttribute('y', pos9.y.toString())
          expect(piece14).toHaveAttribute('x', pos14.x.toString())
          expect(piece14).toHaveAttribute('y', pos14.y.toString())
        })

        it('moves with capture change material balance', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
        })

        it('respects previously played moves', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
        })

        it('properly handles multi-capture move', () => {
          const rr = render(<Board moves={['e3-d4', 'b6-a5', 'c3-b4', 'a5:c3:e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          expect(rr.queryAllByRole('white-man')).toHaveLength(10)
          expect(rr.queryAllByRole('black-man')).toHaveLength(12)
        })

        it('roll back on partial moves removal', () => {
          const rr = render(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          expect(rr.queryAllByRole('white-man')).toHaveLength(11)
          expect(rr.queryAllByRole('black-man')).toHaveLength(11)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          expect(rr.queryAllByRole('white-man')).toHaveLength(12)
          expect(rr.queryAllByRole('black-man')).toHaveLength(12)
        })

        it('roll back to initial position on all moves removal', () => {
          const rr = render(<Board moves={[]} />)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
          })
          rr.rerender(<Board moves={[]} />)
          act(() => {
            jest.runAllTimers()
          })
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })

        it('roll back from state with selected piece', () => {
          const rr = render(<Board moves={[]} />)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board moves={['c3-d4', 'f6-e5', 'd4:f6', 'g7:e5']} />)
          act(() => {
            jest.runAllTimers()
            fireEvent.click(rr.getByRole('d2')) // select piece
          })
          rr.rerender(<Board moves={[]} />)
          act(() => {
            jest.runAllTimers()
          })
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })
      })

      describe('with specified position', () => {
        it('properly changes position when passed single move', () => {
          const rr = render(<Board position='c3, b6' moves={['c3-d4']} />)
          act(() => {
            jest.runAllTimers()
          })
          const piece = rr.queryByTestId('piece0')
          const {x, y} = centerOf(d4)
          expect(piece).toHaveAttribute('x', x.toString())
          expect(piece).toHaveAttribute('y', y.toString())
        })

        it('roll back to specified position on all moves removal', () => {
          const rr = render(<Board position='c3, b6' moves={[]} />)
          const before = prettyDOM(rr.container.firstChild as Element, 100000)
          rr.rerender(<Board position='c3, b6' moves={['c3-d4', 'b6-e5', 'd4:f6']} />)
          act(() => {
            jest.runAllTimers()
          })
          rr.rerender(<Board position='c3, b6' moves={[]} />)
          act(() => {
            jest.runAllTimers()
          })
          const after = prettyDOM(rr.container.firstChild as Element, 100000)
          expect(after).toBe(before)
        })
      })
    })
  })
})
