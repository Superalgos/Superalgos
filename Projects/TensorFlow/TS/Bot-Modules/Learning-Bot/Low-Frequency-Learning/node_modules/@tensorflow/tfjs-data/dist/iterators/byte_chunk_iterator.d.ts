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
import { LazyIterator } from './lazy_iterator';
import { StringIterator } from './string_iterator';
export declare abstract class ByteChunkIterator extends LazyIterator<Uint8Array> {
    /**
     * Decode a stream of UTF8-encoded byte arrays to a stream of strings.
     *
     * The byte arrays producetd from the ByteChunkIterator on which this is
     * called will be interpreted as concatenated.  No assumptions are made about
     * the boundaries of the incoming chunks, so a multi-byte UTF8 encoding of a
     * character may span the boundary between chunks.  This naturally happens,
     * for instance, when reading fixed-size byte arrays from a file.
     */
    decodeUTF8(): StringIterator;
}
