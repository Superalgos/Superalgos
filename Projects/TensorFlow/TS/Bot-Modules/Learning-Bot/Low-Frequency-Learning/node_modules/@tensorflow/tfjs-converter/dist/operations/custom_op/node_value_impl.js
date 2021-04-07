/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
import { getTensor } from '../executors/utils';
import { getBoolArrayParam, getBoolParam, getDtypeArrayParam, getDtypeParam, getNumberParam, getNumericArrayParam, getStringArrayParam, getStringParam, getTensorShapeArrayParam, getTensorShapeParam } from '../operation_mapper';
/**
 * Helper class for lookup inputs and params for nodes in the model graph.
 */
export class NodeValueImpl {
    constructor(node, tensorMap, context) {
        this.node = node;
        this.tensorMap = tensorMap;
        this.context = context;
        this.inputs = [];
        this.attrs = {};
        this.inputs = node.inputNames.map(name => this.getInput(name));
        if (node.rawAttrs != null) {
            this.attrs = Object.keys(node.rawAttrs)
                .reduce((attrs, key) => {
                attrs[key] = this.getAttr(key);
                return attrs;
            }, {});
        }
    }
    /**
     * Return the value of the attribute or input param.
     * @param name String: name of attribute or input param.
     */
    getInput(name) {
        return getTensor(name, this.tensorMap, this.context);
    }
    /**
     * Return the value of the attribute or input param.
     * @param name String: name of attribute or input param.
     */
    getAttr(name, defaultValue) {
        const value = this.node.rawAttrs[name];
        if (value.tensor != null) {
            return getTensor(name, this.tensorMap, this.context);
        }
        if (value.i != null || value.f != null) {
            return getNumberParam(this.node.rawAttrs, name, defaultValue);
        }
        if (value.s != null) {
            return getStringParam(this.node.rawAttrs, name, defaultValue);
        }
        if (value.b != null) {
            return getBoolParam(this.node.rawAttrs, name, defaultValue);
        }
        if (value.shape != null) {
            return getTensorShapeParam(this.node.rawAttrs, name, defaultValue);
        }
        if (value.type != null) {
            return getDtypeParam(this.node.rawAttrs, name, defaultValue);
        }
        if (value.list != null) {
            if (value.list.i != null || value.list.f != null) {
                return getNumericArrayParam(this.node.rawAttrs, name, defaultValue);
            }
            if (value.list.s != null) {
                return getStringArrayParam(this.node.rawAttrs, name, defaultValue);
            }
            if (value.list.shape != null) {
                return getTensorShapeArrayParam(this.node.rawAttrs, name, defaultValue);
            }
            if (value.list.b != null) {
                return getBoolArrayParam(this.node.rawAttrs, name, defaultValue);
            }
            if (value.list.type != null) {
                return getDtypeArrayParam(this.node.rawAttrs, name, defaultValue);
            }
        }
        return defaultValue;
    }
}
//# sourceMappingURL=node_value_impl.js.map