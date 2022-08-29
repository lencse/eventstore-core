import { InvalidEvent } from '../src';

describe('InvalidEvent', () => {
    it('is throwable', () => {
        expect(() => {
            throw new InvalidEvent()
        }).toThrowError(InvalidEvent)
    })
})
