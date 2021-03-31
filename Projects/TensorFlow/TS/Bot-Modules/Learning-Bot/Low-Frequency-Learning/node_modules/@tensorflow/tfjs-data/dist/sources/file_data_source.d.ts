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
import { DataSource } from '../datasource';
import { ByteChunkIterator } from '../iterators/byte_chunk_iterator';
import { FileChunkIteratorOptions } from '../iterators/file_chunk_iterator';
import { FileElement } from '../types';
/**
 * Represents a file, blob, or Uint8Array readable as a stream of binary data
 * chunks.
 */
export declare class FileDataSource extends DataSource {
    protected input: FileElement | string;
    protected readonly options: FileChunkIteratorOptions;
    /**
     * Create a `FileDataSource`.
     *
     * @param input Local file path, or `File`/`Blob`/`Uint8Array` object to
     *     read. Local file only works in node environment.
     * @param options Options passed to the underlying `FileChunkIterator`s,
     *   such as {chunksize: 1024}.
     */
    constructor(input: FileElement | string, options?: FileChunkIteratorOptions);
    iterator(): Promise<ByteChunkIterator>;
}
