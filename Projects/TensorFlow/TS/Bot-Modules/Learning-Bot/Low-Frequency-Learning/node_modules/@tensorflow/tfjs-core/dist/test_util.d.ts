/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
 * =============================================================================
 */
import { RecursiveArray, TensorLike, TypedArray } from './types';
export declare const TEST_EPSILON_FLOAT16 = 0.1;
export declare function expectArraysClose(actual: TypedArray | number | RecursiveArray<number>, expected: TypedArray | number | RecursiveArray<number>, epsilon?: number): void;
export declare function testEpsilon(): 0.1 | 0.001;
export interface DoneFn {
    (): void;
    fail: (message?: Error | string) => void;
}
export declare function expectPromiseToFail(fn: () => Promise<{}>, done: DoneFn): void;
export declare function expectArraysEqual(actual: TensorLike, expected: TensorLike): void;
export declare function expectNumbersClose(a: number, e: number, epsilon?: number): void;
export declare function expectValuesInRange(actual: TypedArray | number[], low: number, high: number): void;
export declare function expectArrayBuffersEqual(actual: ArrayBuffer, expected: ArrayBuffer): void;
/** Encodes strings into utf-8 bytes. */
export declare function encodeStrings(a: RecursiveArray<{}>): RecursiveArray<Uint8Array>;
