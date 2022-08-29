import { StreamEvent, inMemoryEventStore } from '../src'
import { StreamProcessor } from '../src/types'

type AddEvent = StreamEvent<'add', { addend: number }>
type SubtractEvent = StreamEvent<'subtract', { subtrahend: number }>
type MultiplyEvent = StreamEvent<'multiply', { multiplicant: number }>

type OperatorEvent = AddEvent | SubtractEvent | MultiplyEvent

const calculatorProcessor: StreamProcessor<number, OperatorEvent> = {
    initialValue: 0,
    reducer: {
        add: (eventData, current) => current + eventData.addend,
        subtract: (eventData, current) => current - eventData.subtrahend,
        multiply: (eventData, current) => current * eventData.multiplicant
    }
}

const operatorLoggingProcessor: StreamProcessor<string, OperatorEvent> = {
    initialValue: '',
    reducer: {
        add: (eventData, current) => `${current}+`,
        subtract: (eventData, current) => `${current}-`,
        multiply: (eventData, current) => `${current}*`
    }
}

describe('In-memory Event Store streams', () => {
    it('iterates through multiple streams', async () => {
        const store = await inMemoryEventStore()
        const eventStreams: Array<{
            name: string
            events: OperatorEvent[]
            expectedResult: number
            expectedLog: string
        }> = [
            {
                name: `stream-1-${Date.now()}`,
                events: [
                    { type: 'add', data: { addend: 2 } },
                    { type: 'multiply', data: { multiplicant: 5 } },
                    { type: 'add', data: { addend: 3 } },
                    { type: 'subtract', data: { subtrahend: 4 } }
                ],
                expectedResult: 9,
                expectedLog: '+*+-'
            },
            {
                name: `stream-2-${Date.now()}`,
                events: [
                    { type: 'add', data: { addend: 1 } },
                    { type: 'multiply', data: { multiplicant: 0 } },
                    { type: 'subtract', data: { subtrahend: 2 } }
                ],
                expectedResult: -2,
                expectedLog: '+*-'
            },
            {
                name: `stream-3-${Date.now()}`,
                events: [
                    { type: 'add', data: { addend: 2 } },
                    { type: 'multiply', data: { multiplicant: 2 } },
                    { type: 'multiply', data: { multiplicant: 2 } },
                    { type: 'multiply', data: { multiplicant: 2 } },
                    { type: 'multiply', data: { multiplicant: 2 } }
                ],
                expectedResult: 32,
                expectedLog: '+****'
            },
            {
                name: `stream-4-${Date.now()}`,
                events: [],
                expectedResult: 0,
                expectedLog: ''
            }
        ]
        await Promise.all(eventStreams.map(async stream => {
            for (const event of stream.events) {
                await store.stream<OperatorEvent>(stream.name).addEvent(event)
            }
        }))
        for (const stream of eventStreams) {
            const result = await store.stream<OperatorEvent>(stream.name)
                .process<number>(calculatorProcessor)
            expect(result).toBe(stream.expectedResult)
            const log = await store.stream<OperatorEvent>(stream.name)
                .process<string>(operatorLoggingProcessor)
            expect(log).toBe(stream.expectedLog)
        }
    })
})
