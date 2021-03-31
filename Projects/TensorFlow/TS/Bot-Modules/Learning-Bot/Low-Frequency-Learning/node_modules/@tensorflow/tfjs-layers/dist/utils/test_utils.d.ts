/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * Testing utilities.
 */
import { Tensor } from '@tensorflow/tfjs-core';
/**
 * Expect values are close between a Tensor or number array.
 * @param actual
 * @param expected
 */
export declare function expectTensorsClose(actual: Tensor | number[], expected: Tensor | number[], epsilon?: number): void;
/**
 * Expect values in array are within a specified range, boundaries inclusive.
 * @param actual
 * @param expected
 */
export declare function expectTensorsValuesInRange(actual: Tensor, low: number, high: number): void;
/**
 * Describe tests to be run on CPU and GPU.
 * @param testName
 * @param tests
 */
export declare function describeMathCPUAndGPU(testName: string, tests: () => void): void;
/**
 * Describe tests to be run on CPU only.
 * @param testName
 * @param tests
 */
export declare function describeMathCPU(testName: string, tests: () => void): void;
/**
 * Describe tests to be run on GPU only.
 * @param testName
 * @param tests
 */
export declare function describeMathGPU(testName: string, tests: () => void): void;
/**
 * Check that a function only generates the expected number of new Tensors.
 *
 * The test  function is called twice, once to prime any regular constants and
 * once to ensure that additional copies aren't created/tensors aren't leaked.
 *
 * @param testFunc A fully curried (zero arg) version of the function to test.
 * @param numNewTensors The expected number of new Tensors that should exist.
 */
export declare function expectNoLeakedTensors(testFunc: () => any, numNewTensors: number): void;
