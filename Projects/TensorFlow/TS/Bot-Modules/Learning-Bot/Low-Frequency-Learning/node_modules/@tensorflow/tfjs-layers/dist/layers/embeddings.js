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
 * TensorFlow.js Layers: Embedding Layer.
 *
 * Original source: keras/constraints.py
 */
import { notEqual, serialization, tidy, zerosLike } from '@tensorflow/tfjs-core';
import * as K from '../backend/tfjs_backend';
import { getConstraint, serializeConstraint } from '../constraints';
import { Layer } from '../engine/topology';
import { ValueError } from '../errors';
import { getInitializer, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import * as generic_utils from '../utils/generic_utils';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
export class Embedding extends Layer {
    constructor(args) {
        super(args);
        this.embeddings = null;
        this.DEFAULT_EMBEDDINGS_INITIALIZER = 'randomUniform';
        if (args.batchInputShape == null && args.inputShape == null) {
            // Porting Note: This logic is copied from Layer's constructor, since we
            // can't do exactly what the Python constructor does for Embedding().
            // Specifically, the super constructor can not be called after the
            // mutation of the `config` argument.
            let batchSize = null;
            if (args.batchSize != null) {
                batchSize = args.batchSize;
            }
            if (args.inputLength == null) {
                // Fix super-constructor to what it would have done if
                // 'config.inputShape' were (None, )
                this.batchInputShape = [batchSize, null];
            }
            else {
                // Fix super-constructor to what it would have done if
                // 'config.inputShape' were (config.inputLength, )
                this.batchInputShape =
                    [batchSize].concat(generic_utils.toList(args.inputLength));
            }
        }
        this.inputDim = args.inputDim;
        generic_utils.assertPositiveInteger(this.inputDim, 'inputDim');
        this.outputDim = args.outputDim;
        generic_utils.assertPositiveInteger(this.outputDim, 'outputDim');
        this.embeddingsInitializer = getInitializer(args.embeddingsInitializer || this.DEFAULT_EMBEDDINGS_INITIALIZER);
        this.embeddingsRegularizer = getRegularizer(args.embeddingsRegularizer);
        this.activityRegularizer = getRegularizer(args.activityRegularizer);
        this.embeddingsConstraint = getConstraint(args.embeddingsConstraint);
        this.maskZero = args.maskZero;
        this.supportsMasking = args.maskZero;
        this.inputLength = args.inputLength;
    }
    build(inputShape) {
        this.embeddings = this.addWeight('embeddings', [this.inputDim, this.outputDim], this.dtype, this.embeddingsInitializer, this.embeddingsRegularizer, true, this.embeddingsConstraint);
        this.built = true;
    }
    // Override warnOnIncompatibleInputShape because an embedding layer allows
    // the input to have varying ranks.
    warnOnIncompatibleInputShape(inputShape) { }
    computeMask(inputs, mask) {
        return tidy(() => {
            if (!this.maskZero) {
                return null;
            }
            else {
                inputs = getExactlyOneTensor(inputs);
                return notEqual(inputs, zerosLike(inputs));
            }
        });
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        if (this.inputLength == null) {
            return [...inputShape, this.outputDim];
        }
        // inputLength can be an array if input is 3D or higher.
        const inLens = generic_utils.toList(this.inputLength);
        if (inLens.length !== inputShape.length - 1) {
            throw new ValueError(`"inputLength" is ${this.inputLength}, but received ` +
                `input shape has shape ${inputShape}`);
        }
        else {
            let i = 0;
            for (let k = 0; k < inLens.length; ++k) {
                const s1 = inLens[k];
                const s2 = inputShape[k + 1];
                if ((s1 != null) && (s2 != null) && (s1 !== s2)) {
                    throw new ValueError(`"inputLength" is ${this.inputLength}, but received ` +
                        `input shape has shape ${inputShape}`);
                }
                else if (s1 == null) {
                    inLens[i] = s2;
                }
                i++;
            }
        }
        return [inputShape[0], ...inLens, this.outputDim];
    }
    call(inputs, kwargs) {
        return tidy(() => {
            this.invokeCallHook(inputs, kwargs);
            // Embedding layer accepts only a single input.
            let input = getExactlyOneTensor(inputs);
            if (input.dtype !== 'int32') {
                input = K.cast(input, 'int32');
            }
            const output = K.gather(this.embeddings.read(), input.as1D());
            return output.reshape(getExactlyOneShape(this.computeOutputShape(input.shape)));
        });
    }
    getConfig() {
        const config = {
            inputDim: this.inputDim,
            outputDim: this.outputDim,
            embeddingsInitializer: serializeInitializer(this.embeddingsInitializer),
            embeddingsRegularizer: serializeRegularizer(this.embeddingsRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            embeddingsConstraint: serializeConstraint(this.embeddingsConstraint),
            maskZero: this.maskZero,
            inputLength: this.inputLength
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Embedding.className = 'Embedding';
serialization.registerClass(Embedding);
//# sourceMappingURL=embeddings.js.map