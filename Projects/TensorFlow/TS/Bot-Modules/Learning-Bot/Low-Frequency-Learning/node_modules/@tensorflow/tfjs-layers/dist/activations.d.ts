/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { ActivationIdentifier } from './keras_format/activation_config';
/**
 * Base class for Activations.
 *
 * Special note: due to cross-language compatibility reasons, the
 * static readonly className field in this family of classes must be set to
 * the initialLowerCamelCase name of the activation.
 */
export declare abstract class Activation extends serialization.Serializable {
    abstract apply(tensor: Tensor, axis?: number): Tensor;
    getConfig(): serialization.ConfigDict;
}
/**
 * Exponential linear unit (ELU).
 * Reference: https://arxiv.org/abs/1511.07289
 */
export declare class Elu extends Activation {
    /** @nocollapse */
    static readonly className = "elu";
    /**
     * Calculate the activation function.
     *
     * @param x: Input.
     * @param alpha: Scaling factor the negative section.
     * @return Output of the ELU activation.
     */
    apply(x: Tensor, alpha?: number): Tensor;
}
/**
 * Scaled Exponential Linear Unit. (Klambauer et al., 2017).
 * Reference: Self-Normalizing Neural Networks, https://arxiv.org/abs/1706.02515
 * Notes:
 *   - To be used together with the initialization "lecunNormal".
 *   - To be used together with the dropout variant "AlphaDropout".
 */
export declare class Selu extends Activation {
    /** @nocollapse */
    static readonly className = "selu";
    apply(x: Tensor): Tensor;
}
/**
 *  Rectified linear unit
 */
export declare class Relu extends Activation {
    /** @nocollapse */
    static readonly className = "relu";
    apply(x: Tensor): Tensor;
}
/**
 * Rectified linear unit activation maxing out at 6.0.
 */
export declare class Relu6 extends Activation {
    /** @nocollapse */
    static readonly className = "relu6";
    apply(x: Tensor): Tensor;
}
export declare class Linear extends Activation {
    /** @nocollapse */
    static readonly className = "linear";
    apply(x: Tensor): Tensor;
}
/**
 * Sigmoid activation function.
 */
export declare class Sigmoid extends Activation {
    /** @nocollapse */
    static readonly className = "sigmoid";
    apply(x: Tensor): Tensor;
}
/**
 * Segment-wise linear approximation of sigmoid.
 */
export declare class HardSigmoid extends Activation {
    /** @nocollapse */
    static readonly className = "hardSigmoid";
    apply(x: Tensor): Tensor;
}
/**
 * Softplus activation function.
 */
export declare class Softplus extends Activation {
    /** @nocollapse */
    static readonly className = "softplus";
    apply(x: Tensor): Tensor;
}
/**
 * Softsign activation function.
 */
export declare class Softsign extends Activation {
    /** @nocollapse */
    static readonly className = "softsign";
    apply(x: Tensor): Tensor;
}
/**
 * Hyperbolic tangent function.
 */
export declare class Tanh extends Activation {
    /** @nocollapse */
    static readonly className = "tanh";
    apply(x: Tensor): Tensor;
}
/**
 * Softmax activation function
 */
export declare class Softmax extends Activation {
    /** @nocollapse */
    static readonly className = "softmax";
    /**
     * Calculate the activation function.
     *
     * @param x Tensor.
     * @param axis Integer, axis along which the softmax normalization is applied.
     * Invalid if < 2, as softmax across 1 (the batch dimension) is assumed to be
     * an error.
     *
     * @returns a Tensor of the same shape as x
     *
     * @throws ValueError: In case `dim(x) < 2`.
     */
    apply(x: Tensor, axis?: number): Tensor;
}
/**
 * Log softmax activation function
 */
export declare class LogSoftmax extends Activation {
    /** @nocollapse */
    static readonly className = "logSoftmax";
    /**
     * Calculate the activation function of log softmax:
     * log( exp(x_i) / sum(exp(x)) )
     *
     * @param x Tensor.
     * @param axis Integer, axis along which the softmax normalization is applied.
     * Invalid if < 2, as softmax across 1 (the batch dimension) is assumed to be
     * an error.
     *
     * @returns a Tensor of the same shape as x
     *
     * @throws ValueError: In case `dim(x) < 2`.
     */
    apply(x: Tensor, axis?: number): Tensor;
}
/**
 * Swish activation function
 */
export declare class Swish extends Activation {
    /** @nocollapse */
    static readonly className = "swish";
    /**
     * Calculate the activation function.
     *
     * @param x Tensor.
     * @param alpha Scaling factor for the sigmoid function.
     * @returns a Tensor of the same shape as x
     */
    apply(x: Tensor, alpha?: number): Tensor;
}
export declare function serializeActivation(activation: Activation): string;
export declare function deserializeActivation(config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): Activation;
export declare function getActivation(identifier: ActivationIdentifier | serialization.ConfigDict | Activation): Activation;
