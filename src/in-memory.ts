import { processEvents } from './processor'
import { StreamEvent, EventStore, EventStream, StreamProcessor } from './types'

class InMemoryEventStream<E extends StreamEvent> implements EventStream<E> {
    private readonly events: E[] = []

    public async addEvent(event: E): Promise<void> {
        this.events.push(event)
    }

    public async process<T>(processor: StreamProcessor<T, E>): Promise<T> {
        const events = this.events
        return await processEvents<E, T>(
            function * () {
                for (const event of events) {
                    yield new Promise(resolve => resolve(event))
                }
            },
            processor
        )
    }
}

class InMemoryEventStore implements EventStore {
    private readonly streams = new Map<string, InMemoryEventStream<StreamEvent>>()

    public stream<E extends StreamEvent>(name: string): EventStream<E> {
        if (!this.streams.has(name)) {
            this.streams.set(name, new InMemoryEventStream<E>())
        }
        return this.streams.get(name) as unknown as EventStream<E>
    }
}

export const inMemoryEventStore = async (): Promise<EventStore> => {
    return new InMemoryEventStore()
}
