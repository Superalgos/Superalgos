/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization } from '@tensorflow/tfjs-core';
import { PyJsonValue } from '../keras_format/types';
/**
 * Convert a Pythonic config object to TypeScript config object.
 * @param pythonicConfig The config object to convert.
 * @param key Optional key name of the object being converted.
 * @returns Result of the conversion.
 */
export declare function convertPythonicToTs(pythonicConfig: PyJsonValue, key?: string): serialization.ConfigDictValue;
/**
 * Convert a TypeScript config object to Python config object.
 * @param tsConfig The config object to convert.
 * @param key Optional key name of the object being converted.
 * @returns Result of the conversion.
 */
export declare function convertTsToPythonic(tsConfig: serialization.ConfigDictValue, key?: string): PyJsonValue;
