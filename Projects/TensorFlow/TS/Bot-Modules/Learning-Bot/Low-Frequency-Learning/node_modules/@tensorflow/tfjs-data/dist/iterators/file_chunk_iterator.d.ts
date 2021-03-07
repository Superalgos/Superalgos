/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 */
import { FileElement } from '../types';
import { ByteChunkIterator } from './byte_chunk_iterator';
export interface FileChunkIteratorOptions {
    /** The byte offset at which to begin reading the File or Blob. Default 0. */
    offset?: number;
    /** The number of bytes to read at a time. Default 1MB. */
    chunkSize?: number;
}
/**
 * Provide a stream of chunks from a File, Blob, or Uint8Array.
 * @param file The source File, Blob or Uint8Array.
 * @param options Optional settings controlling file reading.
 * @returns a lazy Iterator of Uint8Arrays containing sequential chunks of the
 *   input File, Blob or Uint8Array.
 */
export declare class FileChunkIterator extends ByteChunkIterator {
    protected file: FileElement;
    protected options: FileChunkIteratorOptions;
    offset: number;
    chunkSize: number;
    constructor(file: FileElement, options?: FileChunkIteratorOptions);
    summary(): string;
    next(): Promise<IteratorResult<Uint8Array>>;
}
