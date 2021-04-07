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
import { getUid } from '../backend/state';
import { ValueError } from '../errors';
import { Layer, Node, SymbolicTensor } from './topology';
export class InputLayer extends Layer {
    constructor(args) {
        super({
            dtype: args.dtype,
            name: args.name != null ? args.name : getUid('input').toString()
        });
        // Normalize config.batchSize and config.sparse
        if (args.batchSize == null) {
            args.batchSize = null;
        }
        if (args.sparse == null) {
            args.sparse = false;
        }
        this.trainable = false;
        this.built = true;
        this.sparse = args.sparse;
        if (args.inputShape != null && args.batchInputShape != null) {
            throw new ValueError('Only provide the inputShape OR ' +
                'batchInputShape argument to inputLayer, not both at the same time.');
        }
        let batchInputShape = args.batchInputShape;
        if (batchInputShape == null) {
            if (args.inputShape == null) {
                throw new ValueError('An InputLayer should be passed either a ' +
                    '`batchInputShape` or an `inputShape`.');
            }
            else {
                batchInputShape = [args.batchSize].concat(args.inputShape);
            }
        }
        else {
            // TODO(michaelterry): Backport to PyKeras
            if (args.batchSize != null) {
                throw new ValueError('Cannot specify batchSize if batchInputShape is ' +
                    'specified when creating an InputLayer.');
            }
        }
        const dtype = args.dtype || 'float32';
        this.batchInputShape = batchInputShape;
        this.dtype = dtype;
        // TODO(michaelterry): Backport this to PyKeras?
        this.inputSpec = [{ shape: batchInputShape }];
        const inputTensor = new SymbolicTensor(this.dtype, this.batchInputShape, this, [], {}, this.name);
        inputTensor.nodeIndex = 0;
        inputTensor.tensorIndex = 0;
        // Create an input node to add to this.outboundNode.
        // (This call has side effects.)
        // tslint:disable-next-line:no-unused-expression
        new Node({
            outboundLayer: this,
            inboundLayers: [],
            nodeIndices: [],
            tensorIndices: [],
            inputTensors: [inputTensor],
            outputTensors: [inputTensor],
            inputMasks: [null],
            outputMasks: [null],
            inputShapes: [batchInputShape],
            outputShapes: [batchInputShape]
        });
    }
    apply(inputs, kwargs) {
        throw new ValueError('Cannot pass any input to an ' +
            `InputLayer's apply() method. InputLayer name: ${this.name}`);
    }
    dispose() {
        // dispose() for InputLayer is overridden as no-op.
        return { refCountAfterDispose: this._refCount, numDisposedVariables: 0 };
    }
    getConfig() {
        return {
            batchInputShape: this.batchInputShape,
            dtype: this.dtype,
            sparse: this.sparse,
            name: this.name
        };
    }
}
/** @nocollapse */
InputLayer.className = 'InputLayer';
serialization.registerClass(InputLayer);
export function Input(config) {
    if (config.batchShape == null && config.shape == null) {
        throw new Error('Please provide to Input either a `shape`' +
            ' or a `batchShape` argument. Note that ' +
            '`shape` does not include the batch ' +
            'dimension.');
    }
    if (config.batchShape != null && config.shape != null) {
        // TODO(michaelterry): Backport to PyKeras.
        throw new ValueError('Please provide either a `shape` or `batchShape` ' +
            'argument to Input, but not both.');
    }
    let batchShape = config.batchShape;
    if (config.shape != null && batchShape == null) {
        batchShape = [null].concat(config.shape);
    }
    let dtype = config.dtype;
    if (dtype == null) {
        dtype = 'float32';
    }
    const inputLayer = new InputLayer({
        batchInputShape: batchShape,
        name: config.name,
        dtype,
        sparse: config.sparse
    });
    const outputs = inputLayer.inboundNodes[0].outputTensors;
    return outputs[0];
}
//# sourceMappingURL=input_layer.js.map