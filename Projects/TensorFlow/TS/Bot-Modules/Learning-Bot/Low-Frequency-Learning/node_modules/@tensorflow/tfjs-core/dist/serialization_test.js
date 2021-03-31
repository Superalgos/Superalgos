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
import { Optimizer } from './optimizers/optimizer';
import { registerClass, SerializationMap } from './serialization';
describe('registerClass', () => {
    const randomClassName = `OptimizerForTest${Math.random()}`;
    class OptimizerForTest extends Optimizer {
        constructor() {
            super();
        }
        applyGradients(variableGradients) { }
        getConfig() {
            return {};
        }
    }
    OptimizerForTest.className = randomClassName;
    it('registerClass succeeds', () => {
        registerClass(OptimizerForTest);
        expect(SerializationMap.getMap().classNameMap[randomClassName] != null)
            .toEqual(true);
    });
    class OptimizerWithoutClassName extends Optimizer {
        constructor() {
            super();
        }
        applyGradients(variableGradients) { }
        getConfig() {
            return {};
        }
    }
    it('registerClass fails on missing className', () => {
        // tslint:disable-next-line:no-any
        expect(() => registerClass(OptimizerWithoutClassName))
            .toThrowError(/does not have the static className property/);
    });
    class OptimizerWithEmptyClassName extends Optimizer {
        constructor() {
            super();
        }
        applyGradients(variableGradients) { }
        getConfig() {
            return {};
        }
    }
    OptimizerWithEmptyClassName.className = '';
    it('registerClass fails on missing className', () => {
        expect(() => registerClass(OptimizerWithEmptyClassName))
            .toThrowError(/has an empty-string as its className/);
    });
    class OptimizerWithNonStringClassName extends Optimizer {
        constructor() {
            super();
        }
        applyGradients(variableGradients) { }
        getConfig() {
            return {};
        }
    }
    OptimizerWithNonStringClassName.className = 42;
    it('registerClass fails on missing className', () => {
        // tslint:disable-next-line:no-any
        expect(() => registerClass(OptimizerWithNonStringClassName))
            .toThrowError(/is required to be a string, but got type number/);
    });
});
//# sourceMappingURL=serialization_test.js.map