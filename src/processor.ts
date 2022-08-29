import { StreamEvent, StreamProcessor } from './types'

export const processEvents =
    async <Event extends StreamEvent, Type>(
        events: () => IterableIterator<Promise<Event>>,
        processor: StreamProcessor<Type, Event>
    ): Promise<Type> => {
        let current = processor.initialValue
        for await (const event of events()) {
            const reducer = processor.reducer[event.type as Event['type']]
            current = reducer(event.data as unknown as never, current)
        }
        return current
    }
