import { processEvents } from '../src';

describe('processEvents', () => {
    it('processes events correctly', async () => {
        const result = await processEvents(function * () {}, {
            reducer: {},
            initialValue: 0
        })
        expect(result).toBe(0)
    })
})
