/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/* original source: keras/regularizers.py */
import * as tfc from '@tensorflow/tfjs-core';
import { abs, add, serialization, sum, tidy, zeros } from '@tensorflow/tfjs-core';
import * as K from './backend/tfjs_backend';
import { deserializeKerasObject, serializeKerasObject } from './utils/generic_utils';
function assertObjectArgs(args) {
    if (args != null && typeof args !== 'object') {
        throw new Error(`Argument to L1L2 regularizer's constructor is expected to be an ` +
            `object, but received: ${args}`);
    }
}
/**
 * Regularizer base class.
 */
export class Regularizer extends serialization.Serializable {
}
export class L1L2 extends Regularizer {
    constructor(args) {
        super();
        assertObjectArgs(args);
        this.l1 = args == null || args.l1 == null ? 0.01 : args.l1;
        this.l2 = args == null || args.l2 == null ? 0.01 : args.l2;
        this.hasL1 = this.l1 !== 0;
        this.hasL2 = this.l2 !== 0;
    }
    /**
     * Porting note: Renamed from __call__.
     * @param x Variable of which to calculate the regularization score.
     */
    apply(x) {
        return tidy(() => {
            let regularization = zeros([1]);
            if (this.hasL1) {
                regularization = add(regularization, sum(tfc.mul(this.l1, abs(x))));
            }
            if (this.hasL2) {
                regularization =
                    add(regularization, sum(tfc.mul(this.l2, K.square(x))));
            }
            return regularization.asScalar();
        });
    }
    getConfig() {
        return { 'l1': this.l1, 'l2': this.l2 };
    }
    /** @nocollapse */
    static fromConfig(cls, config) {
        return new cls({ l1: config['l1'], l2: config['l2'] });
    }
}
/** @nocollapse */
L1L2.className = 'L1L2';
serialization.registerClass(L1L2);
export function l1(args) {
    assertObjectArgs(args);
    return new L1L2({ l1: args != null ? args.l1 : null, l2: 0 });
}
export function l2(args) {
    assertObjectArgs(args);
    return new L1L2({ l2: args != null ? args.l2 : null, l1: 0 });
}
// Maps the JavaScript-like identifier keys to the corresponding keras symbols.
export const REGULARIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP = {
    'l1l2': 'L1L2'
};
export function serializeRegularizer(constraint) {
    return serializeKerasObject(constraint);
}
export function deserializeRegularizer(config, customObjects = {}) {
    return deserializeKerasObject(config, serialization.SerializationMap.getMap().classNameMap, customObjects, 'regularizer');
}
export function getRegularizer(identifier) {
    if (identifier == null) {
        return null;
    }
    if (typeof identifier === 'string') {
        const className = identifier in REGULARIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP ?
            REGULARIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP[identifier] :
            identifier;
        const config = { className, config: {} };
        return deserializeRegularizer(config);
    }
    else if (identifier instanceof Regularizer) {
        return identifier;
    }
    else {
        return deserializeRegularizer(identifier);
    }
}
//# sourceMappingURL=regularizers.js.map