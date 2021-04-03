/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { eye, linalg, mul, ones, randomUniform, scalar, serialization, tidy, truncatedNormal, zeros } from '@tensorflow/tfjs-core';
import * as K from './backend/tfjs_backend';
import { checkDataFormat } from './common';
import { NotImplementedError, ValueError } from './errors';
import { VALID_DISTRIBUTION_VALUES, VALID_FAN_MODE_VALUES } from './keras_format/initializer_config';
import { checkStringTypeUnionValue, deserializeKerasObject, serializeKerasObject } from './utils/generic_utils';
import { arrayProd } from './utils/math_utils';
export function checkFanMode(value) {
    checkStringTypeUnionValue(VALID_FAN_MODE_VALUES, 'FanMode', value);
}
export function checkDistribution(value) {
    checkStringTypeUnionValue(VALID_DISTRIBUTION_VALUES, 'Distribution', value);
}
/**
 * Initializer base class.
 *
 * @doc {
 *   heading: 'Initializers', subheading: 'Classes', namespace: 'initializers'}
 */
export class Initializer extends serialization.Serializable {
    fromConfigUsesCustomObjects() {
        return false;
    }
    getConfig() {
        return {};
    }
}
export class Zeros extends Initializer {
    apply(shape, dtype) {
        return zeros(shape, dtype);
    }
}
/** @nocollapse */
Zeros.className = 'Zeros';
serialization.registerClass(Zeros);
export class Ones extends Initializer {
    apply(shape, dtype) {
        return ones(shape, dtype);
    }
}
/** @nocollapse */
Ones.className = 'Ones';
serialization.registerClass(Ones);
export class Constant extends Initializer {
    constructor(args) {
        super();
        if (typeof args !== 'object') {
            throw new ValueError(`Expected argument of type ConstantConfig but got ${args}`);
        }
        if (args.value === undefined) {
            throw new ValueError(`config must have value set but got ${args}`);
        }
        this.value = args.value;
    }
    apply(shape, dtype) {
        return tidy(() => mul(scalar(this.value), ones(shape, dtype)));
    }
    getConfig() {
        return {
            value: this.value,
        };
    }
}
/** @nocollapse */
Constant.className = 'Constant';
serialization.registerClass(Constant);
export class RandomUniform extends Initializer {
    constructor(args) {
        super();
        this.DEFAULT_MINVAL = -0.05;
        this.DEFAULT_MAXVAL = 0.05;
        this.minval = args.minval || this.DEFAULT_MINVAL;
        this.maxval = args.maxval || this.DEFAULT_MAXVAL;
        this.seed = args.seed;
    }
    apply(shape, dtype) {
        return randomUniform(shape, this.minval, this.maxval, dtype);
    }
    getConfig() {
        return { minval: this.minval, maxval: this.maxval, seed: this.seed };
    }
}
/** @nocollapse */
RandomUniform.className = 'RandomUniform';
serialization.registerClass(RandomUniform);
export class RandomNormal extends Initializer {
    constructor(args) {
        super();
        this.DEFAULT_MEAN = 0.;
        this.DEFAULT_STDDEV = 0.05;
        this.mean = args.mean || this.DEFAULT_MEAN;
        this.stddev = args.stddev || this.DEFAULT_STDDEV;
        this.seed = args.seed;
    }
    apply(shape, dtype) {
        dtype = dtype || 'float32';
        if (dtype !== 'float32' && dtype !== 'int32') {
            throw new NotImplementedError(`randomNormal does not support dType ${dtype}.`);
        }
        return K.randomNormal(shape, this.mean, this.stddev, dtype, this.seed);
    }
    getConfig() {
        return { mean: this.mean, stddev: this.stddev, seed: this.seed };
    }
}
/** @nocollapse */
RandomNormal.className = 'RandomNormal';
serialization.registerClass(RandomNormal);
export class TruncatedNormal extends Initializer {
    constructor(args) {
        super();
        this.DEFAULT_MEAN = 0.;
        this.DEFAULT_STDDEV = 0.05;
        this.mean = args.mean || this.DEFAULT_MEAN;
        this.stddev = args.stddev || this.DEFAULT_STDDEV;
        this.seed = args.seed;
    }
    apply(shape, dtype) {
        dtype = dtype || 'float32';
        if (dtype !== 'float32' && dtype !== 'int32') {
            throw new NotImplementedError(`truncatedNormal does not support dType ${dtype}.`);
        }
        return truncatedNormal(shape, this.mean, this.stddev, dtype, this.seed);
    }
    getConfig() {
        return { mean: this.mean, stddev: this.stddev, seed: this.seed };
    }
}
/** @nocollapse */
TruncatedNormal.className = 'TruncatedNormal';
serialization.registerClass(TruncatedNormal);
export class Identity extends Initializer {
    constructor(args) {
        super();
        this.gain = args.gain != null ? args.gain : 1.0;
    }
    apply(shape, dtype) {
        return tidy(() => {
            if (shape.length !== 2 || shape[0] !== shape[1]) {
                throw new ValueError('Identity matrix initializer can only be used for' +
                    ' 2D square matrices.');
            }
            else {
                return mul(this.gain, eye(shape[0]));
            }
        });
    }
    getConfig() {
        return { gain: this.gain };
    }
}
/** @nocollapse */
Identity.className = 'Identity';
serialization.registerClass(Identity);
/**
 * Computes the number of input and output units for a weight shape.
 * @param shape Shape of weight.
 * @param dataFormat data format to use for convolution kernels.
 *   Note that all kernels in Keras are standardized on the
 *   CHANNEL_LAST ordering (even when inputs are set to CHANNEL_FIRST).
 * @return An length-2 array: fanIn, fanOut.
 */
function computeFans(shape, dataFormat = 'channelsLast') {
    let fanIn;
    let fanOut;
    checkDataFormat(dataFormat);
    if (shape.length === 2) {
        fanIn = shape[0];
        fanOut = shape[1];
    }
    else if ([3, 4, 5].indexOf(shape.length) !== -1) {
        if (dataFormat === 'channelsFirst') {
            const receptiveFieldSize = arrayProd(shape, 2);
            fanIn = shape[1] * receptiveFieldSize;
            fanOut = shape[0] * receptiveFieldSize;
        }
        else if (dataFormat === 'channelsLast') {
            const receptiveFieldSize = arrayProd(shape, 0, shape.length - 2);
            fanIn = shape[shape.length - 2] * receptiveFieldSize;
            fanOut = shape[shape.length - 1] * receptiveFieldSize;
        }
    }
    else {
        const shapeProd = arrayProd(shape);
        fanIn = Math.sqrt(shapeProd);
        fanOut = Math.sqrt(shapeProd);
    }
    return [fanIn, fanOut];
}
export class VarianceScaling extends Initializer {
    /**
     * Constructor of VarianceScaling.
     * @throws ValueError for invalid value in scale.
     */
    constructor(args) {
        super();
        if (args.scale < 0.0) {
            throw new ValueError(`scale must be a positive float. Got: ${args.scale}`);
        }
        this.scale = args.scale == null ? 1.0 : args.scale;
        this.mode = args.mode == null ? 'fanIn' : args.mode;
        checkFanMode(this.mode);
        this.distribution =
            args.distribution == null ? 'normal' : args.distribution;
        checkDistribution(this.distribution);
        this.seed = args.seed;
    }
    apply(shape, dtype) {
        const fans = computeFans(shape);
        const fanIn = fans[0];
        const fanOut = fans[1];
        let scale = this.scale;
        if (this.mode === 'fanIn') {
            scale /= Math.max(1, fanIn);
        }
        else if (this.mode === 'fanOut') {
            scale /= Math.max(1, fanOut);
        }
        else {
            scale /= Math.max(1, (fanIn + fanOut) / 2);
        }
        if (this.distribution === 'normal') {
            const stddev = Math.sqrt(scale);
            dtype = dtype || 'float32';
            if (dtype !== 'float32' && dtype !== 'int32') {
                throw new NotImplementedError(`${this.getClassName()} does not support dType ${dtype}.`);
            }
            return truncatedNormal(shape, 0, stddev, dtype, this.seed);
        }
        else {
            const limit = Math.sqrt(3 * scale);
            return randomUniform(shape, -limit, limit, dtype);
        }
    }
    getConfig() {
        return {
            scale: this.scale,
            mode: this.mode,
            distribution: this.distribution,
            seed: this.seed
        };
    }
}
/** @nocollapse */
VarianceScaling.className = 'VarianceScaling';
serialization.registerClass(VarianceScaling);
export class GlorotUniform extends VarianceScaling {
    /**
     * Constructor of GlorotUniform
     * @param scale
     * @param mode
     * @param distribution
     * @param seed
     */
    constructor(args) {
        super({
            scale: 1.0,
            mode: 'fanAvg',
            distribution: 'uniform',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, GlorotUniform is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
GlorotUniform.className = 'GlorotUniform';
serialization.registerClass(GlorotUniform);
export class GlorotNormal extends VarianceScaling {
    /**
     * Constructor of GlorotNormal.
     * @param scale
     * @param mode
     * @param distribution
     * @param seed
     */
    constructor(args) {
        super({
            scale: 1.0,
            mode: 'fanAvg',
            distribution: 'normal',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, GlorotNormal is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
GlorotNormal.className = 'GlorotNormal';
serialization.registerClass(GlorotNormal);
export class HeNormal extends VarianceScaling {
    constructor(args) {
        super({
            scale: 2.0,
            mode: 'fanIn',
            distribution: 'normal',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, HeNormal is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
HeNormal.className = 'HeNormal';
serialization.registerClass(HeNormal);
export class HeUniform extends VarianceScaling {
    constructor(args) {
        super({
            scale: 2.0,
            mode: 'fanIn',
            distribution: 'uniform',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, HeUniform is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
HeUniform.className = 'HeUniform';
serialization.registerClass(HeUniform);
export class LeCunNormal extends VarianceScaling {
    constructor(args) {
        super({
            scale: 1.0,
            mode: 'fanIn',
            distribution: 'normal',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, LeCunNormal is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
LeCunNormal.className = 'LeCunNormal';
serialization.registerClass(LeCunNormal);
export class LeCunUniform extends VarianceScaling {
    constructor(args) {
        super({
            scale: 1.0,
            mode: 'fanIn',
            distribution: 'uniform',
            seed: args == null ? null : args.seed
        });
    }
    getClassName() {
        // In Python Keras, LeCunUniform is not a class, but a helper method
        // that creates a VarianceScaling object. Use 'VarianceScaling' as
        // class name to be compatible with that.
        return VarianceScaling.className;
    }
}
/** @nocollapse */
LeCunUniform.className = 'LeCunNormal';
serialization.registerClass(LeCunUniform);
export class Orthogonal extends Initializer {
    constructor(args) {
        super();
        this.DEFAULT_GAIN = 1;
        this.gain = args.gain == null ? this.DEFAULT_GAIN : args.gain;
        this.seed = args.seed;
        if (this.seed != null) {
            throw new NotImplementedError('Random seed is not implemented for Orthogonal Initializer yet.');
        }
    }
    apply(shape, dtype) {
        return tidy(() => {
            if (shape.length < 2) {
                throw new NotImplementedError('Shape must be at least 2D.');
            }
            if (shape[0] * shape[1] > 2000) {
                console.warn(`Orthogonal initializer is being called on a matrix with more ` +
                    `than 2000 (${shape[0] * shape[1]}) elements: ` +
                    `Slowness may result.`);
            }
            // TODO(cais): Add seed support.
            const normalizedShape = shape[0] > shape[1] ? [shape[1], shape[0]] : shape;
            const a = K.randomNormal(normalizedShape, 0, 1, 'float32');
            let q = linalg.gramSchmidt(a);
            if (shape[0] > shape[1]) {
                q = q.transpose();
            }
            return mul(this.gain, q);
        });
    }
    getConfig() {
        return {
            gain: this.gain,
            seed: this.seed,
        };
    }
}
/** @nocollapse */
Orthogonal.className = 'Orthogonal';
serialization.registerClass(Orthogonal);
// Maps the JavaScript-like identifier keys to the corresponding registry
// symbols.
export const INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP = {
    'constant': 'Constant',
    'glorotNormal': 'GlorotNormal',
    'glorotUniform': 'GlorotUniform',
    'heNormal': 'HeNormal',
    'heUniform': 'HeUniform',
    'identity': 'Identity',
    'leCunNormal': 'LeCunNormal',
    'leCunUniform': 'LeCunUniform',
    'ones': 'Ones',
    'orthogonal': 'Orthogonal',
    'randomNormal': 'RandomNormal',
    'randomUniform': 'RandomUniform',
    'truncatedNormal': 'TruncatedNormal',
    'varianceScaling': 'VarianceScaling',
    'zeros': 'Zeros'
};
function deserializeInitializer(config, customObjects = {}) {
    return deserializeKerasObject(config, serialization.SerializationMap.getMap().classNameMap, customObjects, 'initializer');
}
export function serializeInitializer(initializer) {
    return serializeKerasObject(initializer);
}
export function getInitializer(identifier) {
    if (typeof identifier === 'string') {
        const className = identifier in INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP ?
            INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP[identifier] :
            identifier;
        /* We have four 'helper' classes for common initializers that
        all get serialized as 'VarianceScaling' and shouldn't go through
        the deserializeInitializer pathway. */
        if (className === 'GlorotNormal') {
            return new GlorotNormal();
        }
        else if (className === 'GlorotUniform') {
            return new GlorotUniform();
        }
        else if (className === 'HeNormal') {
            return new HeNormal();
        }
        else if (className === 'HeUniform') {
            return new HeUniform();
        }
        else if (className === 'LeCunNormal') {
            return new LeCunNormal();
        }
        else if (className === 'LeCunUniform') {
            return new LeCunUniform();
        }
        else {
            const config = {};
            config['className'] = className;
            config['config'] = {};
            return deserializeInitializer(config);
        }
    }
    else if (identifier instanceof Initializer) {
        return identifier;
    }
    else {
        return deserializeInitializer(identifier);
    }
}
//# sourceMappingURL=initializers.js.map