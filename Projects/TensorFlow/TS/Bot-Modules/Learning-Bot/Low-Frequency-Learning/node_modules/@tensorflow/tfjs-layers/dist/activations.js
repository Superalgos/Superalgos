/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
// Layer activation functions
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy } from '@tensorflow/tfjs-core';
import * as K from './backend/tfjs_backend';
import { deserializeKerasObject } from './utils/generic_utils';
/**
 * Base class for Activations.
 *
 * Special note: due to cross-language compatibility reasons, the
 * static readonly className field in this family of classes must be set to
 * the initialLowerCamelCase name of the activation.
 */
export class Activation extends serialization.Serializable {
    getConfig() {
        return {};
    }
}
/**
 * Exponential linear unit (ELU).
 * Reference: https://arxiv.org/abs/1511.07289
 */
export class Elu extends Activation {
    /**
     * Calculate the activation function.
     *
     * @param x: Input.
     * @param alpha: Scaling factor the negative section.
     * @return Output of the ELU activation.
     */
    apply(x, alpha = 1) {
        return K.elu(x, alpha);
    }
}
/** @nocollapse */
Elu.className = 'elu';
serialization.registerClass(Elu);
/**
 * Scaled Exponential Linear Unit. (Klambauer et al., 2017).
 * Reference: Self-Normalizing Neural Networks, https://arxiv.org/abs/1706.02515
 * Notes:
 *   - To be used together with the initialization "lecunNormal".
 *   - To be used together with the dropout variant "AlphaDropout".
 */
export class Selu extends Activation {
    apply(x) {
        return tfc.selu(x);
    }
}
/** @nocollapse */
Selu.className = 'selu';
serialization.registerClass(Selu);
/**
 *  Rectified linear unit
 */
export class Relu extends Activation {
    apply(x) {
        return tfc.relu(x);
    }
}
/** @nocollapse */
Relu.className = 'relu';
serialization.registerClass(Relu);
/**
 * Rectified linear unit activation maxing out at 6.0.
 */
export class Relu6 extends Activation {
    apply(x) {
        return tidy(() => tfc.minimum(6.0, tfc.relu(x)));
    }
}
/** @nocollapse */
Relu6.className = 'relu6';
serialization.registerClass(Relu6);
//* Linear activation (no-op) */
export class Linear extends Activation {
    apply(x) {
        return x;
    }
}
/** @nocollapse */
Linear.className = 'linear';
serialization.registerClass(Linear);
/**
 * Sigmoid activation function.
 */
export class Sigmoid extends Activation {
    apply(x) {
        return tfc.sigmoid(x);
    }
}
/** @nocollapse */
Sigmoid.className = 'sigmoid';
serialization.registerClass(Sigmoid);
/**
 * Segment-wise linear approximation of sigmoid.
 */
export class HardSigmoid extends Activation {
    apply(x) {
        return K.hardSigmoid(x);
    }
}
/** @nocollapse */
HardSigmoid.className = 'hardSigmoid';
serialization.registerClass(HardSigmoid);
/**
 * Softplus activation function.
 */
export class Softplus extends Activation {
    apply(x) {
        return tfc.softplus(x);
    }
}
/** @nocollapse */
Softplus.className = 'softplus';
serialization.registerClass(Softplus);
/**
 * Softsign activation function.
 */
export class Softsign extends Activation {
    apply(x) {
        return K.softsign(x);
    }
}
/** @nocollapse */
Softsign.className = 'softsign';
serialization.registerClass(Softsign);
/**
 * Hyperbolic tangent function.
 */
export class Tanh extends Activation {
    apply(x) {
        return tfc.tanh(x);
    }
}
/** @nocollapse */
Tanh.className = 'tanh';
serialization.registerClass(Tanh);
/**
 * Softmax activation function
 */
export class Softmax extends Activation {
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
    apply(x, axis = (-1)) {
        return tfc.softmax(x, axis);
    }
}
/** @nocollapse */
Softmax.className = 'softmax';
serialization.registerClass(Softmax);
/**
 * Log softmax activation function
 */
export class LogSoftmax extends Activation {
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
    apply(x, axis = (-1)) {
        return tfc.logSoftmax(x, axis);
    }
}
/** @nocollapse */
LogSoftmax.className = 'logSoftmax';
serialization.registerClass(LogSoftmax);
/**
 * Swish activation function
 */
export class Swish extends Activation {
    /**
     * Calculate the activation function.
     *
     * @param x Tensor.
     * @param alpha Scaling factor for the sigmoid function.
     * @returns a Tensor of the same shape as x
     */
    apply(x, alpha = 1) {
        return tidy(() => tfc.sigmoid(x.mul(alpha)).mul(x));
    }
}
/** @nocollapse */
Swish.className = 'swish';
serialization.registerClass(Swish);
export function serializeActivation(activation) {
    return activation.getClassName();
}
export function deserializeActivation(config, customObjects = {}) {
    return deserializeKerasObject(config, serialization.SerializationMap.getMap().classNameMap, customObjects, 'activation');
}
export function getActivation(identifier) {
    if (identifier == null) {
        const config = {};
        config['className'] = 'linear';
        config['config'] = {};
        return deserializeActivation(config);
    }
    if (typeof identifier === 'string') {
        const config = {};
        config['className'] = identifier;
        config['config'] = {};
        return deserializeActivation(config);
    }
    else if (identifier instanceof Activation) {
        return identifier;
    }
    else {
        return deserializeActivation(identifier);
    }
}
//# sourceMappingURL=activations.js.map