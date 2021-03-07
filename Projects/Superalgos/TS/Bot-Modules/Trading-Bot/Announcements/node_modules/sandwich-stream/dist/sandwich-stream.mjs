import { Readable } from 'stream';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

/**
 * Handles Readable streams requests as concatenation through data handling as
 * well adding tags it each begin, end and between of the streams
 */
class SandwichStream extends Readable {
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
    constructor(_a) {
        var { head, tail, separator } = _a, remaining = __rest(_a, ["head", "tail", "separator"]);
        super(remaining);
        this.streamsActive = false;
        this.streams = [];
        this.newStreams = [];
        this.currentStream = null;
        this.head = (null !== head && undefined !== head) ? head : null;
        this.tail = (null !== tail && undefined !== tail) ? tail : null;
        this.separator = (null !== separator && undefined !== separator) ? separator : null;
    }
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
    add(newStream) {
        if (false === this.streamsActive) {
            this.streams.push(newStream);
            newStream.on('error', this.subStreamOnError.bind(this));
        }
        else {
            this.newStreams.push(newStream);
        }
        return this;
    }
    /**
     * Works in a similar way from the Readable read, only that this one checks
     * for whether or not a stream is already being handled
     * @returns This instance of Sandwich Stream
     */
    _read() {
        if (false === this.streamsActive) {
            this.streamsActive = true;
            this.pushHead();
            this.streamNextStream();
        }
    }
    /**
     * Binds an error thrown from one of the streams being handled
     *
     * @param err Error to be bind
     * @returns This instance of Sandwich Stream
     */
    subStreamOnError(err) {
        this.emit('error', err);
    }
    /**
     * Fetches the next stream to be handled
     * @returns This instance of Sandwich Stream
     */
    streamNextStream() {
        if (true === this.nextStream()) {
            this.bindCurrentStreamEvents();
        }
        else {
            this.pushTail();
            this.push(null);
        }
    }
    /**
     * Verifies whether or not the stream queue has ended
     * @returns This instance of Sandwich Stream
     */
    nextStream() {
        const tmp = this.streams.shift();
        this.currentStream = (undefined !== tmp) ? tmp : null;
        return null !== this.currentStream;
    }
    /**
     * Once the current stream starts to pass their data, this handles it in a
     * less complicated way
     * @returns This instance of Sandwich Stream
     */
    bindCurrentStreamEvents() {
        this.currentStream.on('readable', this.currentStreamOnReadable.bind(this));
        this.currentStream.on('end', this.currentStreamOnEnd.bind(this));
    }
    /**
     * Handles the data from a current stream once they are being streamed
     * @returns This instance of Sandwich Stream
     */
    currentStreamOnReadable() {
        const tmp = this.currentStream.read();
        const data = (undefined !== tmp && null !== tmp) ? tmp : '';
        this.push(data);
    }
    /**
     * Handles the tagging once a stream is finished
     * @returns This instance of Sandwich Stream
     */
    currentStreamOnEnd() {
        this.pushSeparator();
        this.streams.concat(this.newStreams);
        this.newStreams = [];
        this.streamNextStream();
    }
    /**
     * Adds the head tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    pushHead() {
        if (null !== this.head) {
            this.push(this.head);
        }
    }
    /**
     * Adds the separator tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    pushSeparator() {
        if (0 < this.streams.length && null !== this.separator) {
            this.push(this.separator);
        }
    }
    /**
     * Adds the tail tag to the Sandwich Stream
     * @returns This instance of Sandwich Stream
     */
    pushTail() {
        if (null !== this.tail) {
            this.push(this.tail);
        }
    }
}

export default SandwichStream;
export { SandwichStream };
