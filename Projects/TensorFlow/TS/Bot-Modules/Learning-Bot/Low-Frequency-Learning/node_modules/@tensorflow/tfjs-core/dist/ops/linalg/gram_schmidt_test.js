/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
import * as tf from '../../index';
import { ALL_ENVS, describeWithFlags } from '../../jasmine_util';
import { expectArraysClose } from '../../test_util';
describeWithFlags('gramSchmidt-tiny', ALL_ENVS, () => {
    it('2x2, Array of Tensor1D', async () => {
        const xs = [
            tf.randomNormal([2], 0, 1, 'float32', 1),
            tf.randomNormal([2], 0, 1, 'float32', 2)
        ];
        const ys = tf.linalg.gramSchmidt(xs);
        const y = tf.stack(ys);
        // Test that the results are orthogonalized and normalized.
        expectArraysClose(await y.transpose().matMul(y).array(), await tf.eye(2).array());
        // Test angle between xs[0] and ys[0] is zero, i.e., the orientation of the
        // first vector is kept.
        expectArraysClose(await tf.sum(xs[0].mul(ys[0])).array(), await tf.norm(xs[0]).mul(tf.norm(ys[0])).array());
    });
    it('3x3, Array of Tensor1D', async () => {
        const xs = [
            tf.randomNormal([3], 0, 1, 'float32', 1),
            tf.randomNormal([3], 0, 1, 'float32', 2),
            tf.randomNormal([3], 0, 1, 'float32', 3)
        ];
        const ys = tf.linalg.gramSchmidt(xs);
        const y = tf.stack(ys);
        expectArraysClose(await y.transpose().matMul(y).array(), await tf.eye(3).array());
        expectArraysClose(await tf.sum(xs[0].mul(ys[0])).array(), await tf.norm(xs[0]).mul(tf.norm(ys[0])).array());
    });
    it('3x3, Matrix', async () => {
        const xs = tf.randomNormal([3, 3], 0, 1, 'float32', 1);
        const y = tf.linalg.gramSchmidt(xs);
        expectArraysClose(await y.transpose().matMul(y).array(), await tf.eye(3).array());
    });
    it('2x3, Matrix', async () => {
        const xs = tf.randomNormal([2, 3], 0, 1, 'float32', 1);
        const y = tf.linalg.gramSchmidt(xs);
        const yT = y.transpose();
        expectArraysClose(await y.matMul(yT).array(), await tf.eye(2).array());
    });
    it('3x2 Matrix throws Error', () => {
        const xs = tf.tensor2d([[1, 2], [3, -1], [5, 1]]);
        expect(() => tf.linalg.gramSchmidt(xs))
            .toThrowError(/Number of vectors \(3\) exceeds number of dimensions \(2\)/);
    });
    it('Mismatching dimensions input throws Error', () => {
        const xs = [tf.tensor1d([1, 2, 3]), tf.tensor1d([-1, 5, 1]), tf.tensor1d([0, 0])];
        expect(() => tf.linalg.gramSchmidt(xs)).toThrowError(/Non-unique/);
    });
    it('Empty input throws Error', () => {
        expect(() => tf.linalg.gramSchmidt([])).toThrowError(/empty/);
    });
});
//# sourceMappingURL=gram_schmidt_test.js.map