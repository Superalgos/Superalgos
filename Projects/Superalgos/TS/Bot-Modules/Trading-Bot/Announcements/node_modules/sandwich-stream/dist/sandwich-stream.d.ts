/// <reference types="node" />
import { Readable, ReadableOptions } from 'stream';
/**
 * Sandwich Options that will configure parsed data
 */
export interface SandwichOptions extends ReadableOptions {
    readonly head?: string | Buffer;
    readonly tail?: string | Buffer;
    readonly separator?: string | Buffer;
}
/**
 * Handles Readable streams requests as concatenation through data handling as
 * well adding tags it each begin, end and between of the streams
 */
export declare class SandwichStream extends Readable {
    private streamsActive;
    private streams;
    private newStreams;
    private head;
    private tail;
    private separator;
    private currentStream;
    /**
     * Initiates the SandwichStream, you can consider it also passing
     * ReadableOptions to it
     *
     * @param head Pushes this content before all other content
     * @param tail Pushes this content after all other data has been pushed
     * @param separator Pushes this content between each stream
     * @param remaining The other kind of options to be passed to Readable
     * @example
     * const ss = new SandwichStream({
     *     head: 'This at the top\n',
     *     tail: '\nThis at the bottom',
     *     separator: '\n --- \n'
     * });
     */
    constructor({ head, tail, separator, ...remaining }: SandwichOptions);
    /**
     * Add a new Readable stream in the queue
     *
     * @param newStream The Readable stream
     * @example
     * sandwichStream.add(streamOne);
     * sandwichStream.add(streamTwo);
     * sandwichStream.add(streamThree);
     * @throws An Error in case that this request was not accepted
     * @returns This instance of Sandwich Stream
     */
    add(newStream: Readable): this;
    /**
     * Works in a similar way from the Readable read, only that this one checks
     * for whether or not a stream is already being handled
     * @returns This instance of Sandwich Stream
     */
    _read(): void;
    /**
     * Binds an error thrown from one of the streams being handled
     *
     * @param err Error to be bind
     * @returns This instance of Sandwich Stream
     */
    private subStreamOnError;
    /**
     * Fetches the next stream to be handled
     * @returns This instance of Sandwich Stream
     */
    private streamNextStream;
    /**
     * Verifies whether or not the stream queue has ended
     * @returns This instance of Sandwich Stream
     */
    private nextStream;
    /**
     * Once the current stream starts to pass their data, this handles it in a
     * less complicated way
     * @returns This instance of Sandwich Stream
     */
    private bindCurrentStreamEvents;
    /**
     * Handles the data from a current stream once they are being streamed
     * @returns This instance of Sandwich Stream
     */
    private currentStreamOnReadable;
    /**
     * Handles the tagging once a stream is finished
     * @returns This instance of Sandwich Stream
     */
    private currentStreamOnEnd;
    /**
     * Adds the head tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    private pushHead;
    /**
     * Adds the separator tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    private pushSeparator;
    /**
     * Adds the tail tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    private pushTail;
}
export default SandwichStream;
//# sourceMappingURL=sandwich-stream.d.ts.map