/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/* Original source: keras/contraints.py */
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy } from '@tensorflow/tfjs-core';
import { epsilon } from './backend/common';
import { deserializeKerasObject, serializeKerasObject } from './utils/generic_utils';
/**
 * Helper function used by many of the Constraints to find the L2Norms.
 */
function calcL2Norms(w, axis) {
    return tidy(() => tfc.sqrt(tfc.sum(tfc.mul(w, w), axis, true)));
}
/**
 * Base class for functions that impose constraints on weight values
 *
 * @doc {
 *   heading: 'Constraints',
 *   subheading: 'Classes',
 *   namespace: 'constraints'
 * }
 */
export class Constraint extends serialization.Serializable {
    getConfig() {
        return {};
    }
}
export class MaxNorm extends Constraint {
    constructor(args) {
        super();
        this.defaultMaxValue = 2;
        this.defaultAxis = 0;
        this.maxValue =
            args.maxValue != null ? args.maxValue : this.defaultMaxValue;
        this.axis = args.axis != null ? args.axis : this.defaultAxis;
    }
    apply(w) {
        return tidy(() => {
            const norms = calcL2Norms(w, this.axis);
            const desired = tfc.clipByValue(norms, 0, this.maxValue);
            return tfc.mul(w, tfc.div(desired, tfc.add(epsilon(), norms)));
        });
    }
    getConfig() {
        return { maxValue: this.maxValue, axis: this.axis };
    }
}
/** @nocollapse */
MaxNorm.className = 'MaxNorm';
serialization.registerClass(MaxNorm);
export class UnitNorm extends Constraint {
    constructor(args) {
        super();
        this.defaultAxis = 0;
        this.axis = args.axis != null ? args.axis : this.defaultAxis;
    }
    apply(w) {
        return tidy(() => tfc.div(w, tfc.add(epsilon(), calcL2Norms(w, this.axis))));
    }
    getConfig() {
        return { axis: this.axis };
    }
}
/** @nocollapse */
UnitNorm.className = 'UnitNorm';
serialization.registerClass(UnitNorm);
export class NonNeg extends Constraint {
    apply(w) {
        return tfc.relu(w);
    }
}
/** @nocollapse */
NonNeg.className = 'NonNeg';
serialization.registerClass(NonNeg);
export class MinMaxNorm extends Constraint {
    constructor(args) {
        super();
        this.defaultMinValue = 0.0;
        this.defaultMaxValue = 1.0;
        this.defaultRate = 1.0;
        this.defaultAxis = 0;
        this.minValue =
            args.minValue != null ? args.minValue : this.defaultMinValue;
        this.maxValue =
            args.maxValue != null ? args.maxValue : this.defaultMaxValue;
        this.rate = args.rate != null ? args.rate : this.defaultRate;
        this.axis = args.axis != null ? args.axis : this.defaultAxis;
    }
    apply(w) {
        return tidy(() => {
            const norms = calcL2Norms(w, this.axis);
            const desired = tfc.add(tfc.mul(this.rate, tfc.clipByValue(norms, this.minValue, this.maxValue)), tfc.mul(1.0 - this.rate, norms));
            return tfc.mul(w, tfc.div(desired, tfc.add(epsilon(), norms)));
        });
    }
    getConfig() {
        return {
            minValue: this.minValue,
            maxValue: this.maxValue,
            rate: this.rate,
            axis: this.axis
        };
    }
}
/** @nocollapse */
MinMaxNorm.className = 'MinMaxNorm';
serialization.registerClass(MinMaxNorm);
// Maps the JavaScript-like identifier keys to the corresponding registry
// symbols.
export const CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP = {
    'maxNorm': 'MaxNorm',
    'minMaxNorm': 'MinMaxNorm',
    'nonNeg': 'NonNeg',
    'unitNorm': 'UnitNorm'
};
export function serializeConstraint(constraint) {
    return serializeKerasObject(constraint);
}
export function deserializeConstraint(config, customObjects = {}) {
    return deserializeKerasObject(config, serialization.SerializationMap.getMap().classNameMap, customObjects, 'constraint');
}
export function getConstraint(identifier) {
    if (identifier == null) {
        return null;
    }
    if (typeof identifier === 'string') {
        const className = identifier in CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP ?
            CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP[identifier] :
            identifier;
        const config = { className, config: {} };
        return deserializeConstraint(config);
    }
    else if (identifier instanceof Constraint) {
        return identifier;
    }
    else {
        return deserializeConstraint(identifier);
    }
}
//# sourceMappingURL=constraints.js.map