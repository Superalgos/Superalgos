/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { PyJsonDict } from './types';
/**
 * The unique string name of a Layer.
 */
export declare type LayerName = string;
/**
 * The index of a Node, identifying a specific invocation of a given Layer.
 */
export declare type NodeIndex = number;
/**
 * The index of a Tensor output by a given Node of a given Layer.
 */
export declare type TensorIndex = number;
/**
 * Arguments to the apply(...) method that produced a specific Node.
 */
export interface NodeArgs extends PyJsonDict {
}
/**
 * A reference to a specific Tensor, given by its Layer name, Node index, and
 * output index, including the apply() arguments associated with the Node.
 *
 * This is used in `NodeConfig` to specify the inputs to each Node.
 */
export declare type TensorKeyWithArgsArray = [LayerName, NodeIndex, TensorIndex, NodeArgs];
/**
 * A reference to a specific Tensor, given by its Layer name, Node index, and
 * output index.
 *
 * This does not include the apply() arguments associated with the Node.  It is
 * used in the LayersModel config to specify the inputLayers and outputLayers.
 * It seems to be an idiosyncrasy of Python Keras that the node arguments are
 * not included here.
 */
export declare type TensorKeyArray = [LayerName, NodeIndex, TensorIndex];
/**
 * A Keras JSON entry representing a Node, i.e. a specific instance of a Layer.
 *
 * By Keras JSON convention, a Node is specified as an array of Tensor keys
 * (i.e., references to Tensors output by other Layers) providing the inputs to
 * this Layer in order.
 */
export declare type NodeConfig = TensorKeyWithArgsArray[];
