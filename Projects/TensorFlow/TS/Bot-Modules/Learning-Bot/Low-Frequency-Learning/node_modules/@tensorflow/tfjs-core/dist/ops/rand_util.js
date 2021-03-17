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
 * =============================================================================
 */
import * as seedrandom from 'seedrandom';
import { expectNumbersClose, testEpsilon } from '../test_util';
// https://en.wikipedia.org/wiki/Marsaglia_polar_method
export class MPRandGauss {
    constructor(mean, stdDeviation, dtype, truncated, seed) {
        this.mean = mean;
        this.stdDev = stdDeviation;
        this.dtype = dtype;
        this.nextVal = NaN;
        this.truncated = truncated;
        if (this.truncated) {
            this.upper = this.mean + this.stdDev * 2;
            this.lower = this.mean - this.stdDev * 2;
        }
        const seedValue = seed ? seed : Math.random();
        this.random = seedrandom.alea(seedValue.toString());
    }
    /** Returns next sample from a Gaussian distribution. */
    nextValue() {
        if (!isNaN(this.nextVal)) {
            const value = this.nextVal;
            this.nextVal = NaN;
            return value;
        }
        let resultX, resultY;
        let isValid = false;
        while (!isValid) {
            let v1, v2, s;
            do {
                v1 = 2 * this.random() - 1;
                v2 = 2 * this.random() - 1;
                s = v1 * v1 + v2 * v2;
            } while (s >= 1 || s === 0);
            const mul = Math.sqrt(-2.0 * Math.log(s) / s);
            resultX = this.mean + this.stdDev * v1 * mul;
            resultY = this.mean + this.stdDev * v2 * mul;
            if (!this.truncated || this.isValidTruncated(resultX)) {
                isValid = true;
            }
        }
        if (!this.truncated || this.isValidTruncated(resultY)) {
            this.nextVal = this.convertValue(resultY);
        }
        return this.convertValue(resultX);
    }
    /** Handles proper rounding for non-floating-point numbers. */
    convertValue(value) {
        if (this.dtype == null || this.dtype === 'float32') {
            return value;
        }
        return Math.round(value);
    }
    /** Returns true if less than 2-standard-deviations from the mean. */
    isValidTruncated(value) {
        return value <= this.upper && value >= this.lower;
    }
}
// Marsaglia, George, and Wai Wan Tsang. 2000. "A Simple Method for Generating
// Gamma Variables."
export class RandGamma {
    constructor(alpha, beta, dtype, seed) {
        this.alpha = alpha;
        this.beta = 1 / beta; // convert rate to scale parameter
        this.dtype = dtype;
        const seedValue = seed ? seed : Math.random();
        this.randu = seedrandom.alea(seedValue.toString());
        this.randn = new MPRandGauss(0, 1, dtype, false, this.randu());
        if (alpha < 1) {
            this.d = alpha + (2 / 3);
        }
        else {
            this.d = alpha - (1 / 3);
        }
        this.c = 1 / Math.sqrt(9 * this.d);
    }
    /** Returns next sample from a gamma distribution. */
    nextValue() {
        let x2, v0, v1, x, u, v;
        while (true) {
            do {
                x = this.randn.nextValue();
                v = 1 + (this.c * x);
            } while (v <= 0);
            v *= v * v;
            x2 = x * x;
            v0 = 1 - (0.331 * x2 * x2);
            v1 = (0.5 * x2) + (this.d * (1 - v + Math.log(v)));
            u = this.randu();
            if (u < v0 || Math.log(u) < v1) {
                break;
            }
        }
        v = (1 / this.beta) * this.d * v;
        if (this.alpha < 1) {
            v *= Math.pow(this.randu(), 1 / this.alpha);
        }
        return this.convertValue(v);
    }
    /** Handles proper rounding for non-floating-point numbers. */
    convertValue(value) {
        if (this.dtype === 'float32') {
            return value;
        }
        return Math.round(value);
    }
}
export class UniformRandom {
    constructor(min = 0, max = 1, dtype, seed) {
        /** Handles proper rounding for non floating point numbers. */
        this.canReturnFloat = () => (this.dtype == null || this.dtype === 'float32');
        this.min = min;
        this.range = max - min;
        this.dtype = dtype;
        if (seed == null) {
            seed = Math.random();
        }
        if (typeof seed === 'number') {
            seed = seed.toString();
        }
        if (!this.canReturnFloat() && this.range <= 1) {
            throw new Error(`The difference between ${min} - ${max} <= 1 and dtype is not float`);
        }
        this.random = seedrandom.alea(seed);
    }
    convertValue(value) {
        if (this.canReturnFloat()) {
            return value;
        }
        return Math.round(value);
    }
    nextValue() {
        return this.convertValue(this.min + this.range * this.random());
    }
}
export function jarqueBeraNormalityTest(values) {
    // https://en.wikipedia.org/wiki/Jarque%E2%80%93Bera_test
    const n = values.length;
    const s = skewness(values);
    const k = kurtosis(values);
    const jb = n / 6 * (Math.pow(s, 2) + 0.25 * Math.pow(k - 3, 2));
    // JB test requires 2-degress of freedom from Chi-Square @ 0.95:
    // http://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm
    const CHI_SQUARE_2DEG = 5.991;
    if (jb > CHI_SQUARE_2DEG) {
        throw new Error(`Invalid p-value for JB: ${jb}`);
    }
}
export function expectArrayInMeanStdRange(actual, expectedMean, expectedStdDev, epsilon) {
    if (epsilon == null) {
        epsilon = testEpsilon();
    }
    const actualMean = mean(actual);
    expectNumbersClose(actualMean, expectedMean, epsilon);
    expectNumbersClose(standardDeviation(actual, actualMean), expectedStdDev, epsilon);
}
function mean(values) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i];
    }
    return sum / values.length;
}
function standardDeviation(values, mean) {
    let squareDiffSum = 0;
    for (let i = 0; i < values.length; i++) {
        const diff = values[i] - mean;
        squareDiffSum += diff * diff;
    }
    return Math.sqrt(squareDiffSum / values.length);
}
function kurtosis(values) {
    // https://en.wikipedia.org/wiki/Kurtosis
    const valuesMean = mean(values);
    const n = values.length;
    let sum2 = 0;
    let sum4 = 0;
    for (let i = 0; i < n; i++) {
        const v = values[i] - valuesMean;
        sum2 += Math.pow(v, 2);
        sum4 += Math.pow(v, 4);
    }
    return (1 / n) * sum4 / Math.pow((1 / n) * sum2, 2);
}
function skewness(values) {
    // https://en.wikipedia.org/wiki/Skewness
    const valuesMean = mean(values);
    const n = values.length;
    let sum2 = 0;
    let sum3 = 0;
    for (let i = 0; i < n; i++) {
        const v = values[i] - valuesMean;
        sum2 += Math.pow(v, 2);
        sum3 += Math.pow(v, 3);
    }
    return (1 / n) * sum3 / Math.pow((1 / (n - 1)) * sum2, 3 / 2);
}
//# sourceMappingURL=rand_util.js.map