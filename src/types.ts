export interface StreamEvent<
    Type extends string = string,
    Data extends Record<string, unknown> = Record<string, unknown>
> {
    type: Type
    data: Data
}

export interface EventStream<Event extends StreamEvent> {
    addEvent: (event: Event) => Promise<void>
    process: <Type>(processor: StreamProcessor<Type, Event>) => Promise<Type>
}

export interface EventStore {
    stream: <Event extends StreamEvent>(name: string) => EventStream<Event>
}

export interface StreamProcessor<Type, Event extends StreamEvent> {
    initialValue: Type
    reducer: StreamReducer<Type, Event>
}

export type StreamReducer<Type, Event extends StreamEvent> = {
    [event in Event as event['type']]: (eventData: event['data'], current: Type) => Type
}

export class InvalidEvent extends Error { }
