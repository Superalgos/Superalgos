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
 *
 * =============================================================================
 */
/** DataType enum. */
export var DataType;
(function (DataType) {
    DataType[DataType["DT_INVALID"] = 0] = "DT_INVALID";
    DataType[DataType["DT_FLOAT"] = 1] = "DT_FLOAT";
    DataType[DataType["DT_DOUBLE"] = 2] = "DT_DOUBLE";
    DataType[DataType["DT_INT32"] = 3] = "DT_INT32";
    DataType[DataType["DT_UINT8"] = 4] = "DT_UINT8";
    DataType[DataType["DT_INT16"] = 5] = "DT_INT16";
    DataType[DataType["DT_INT8"] = 6] = "DT_INT8";
    DataType[DataType["DT_STRING"] = 7] = "DT_STRING";
    DataType[DataType["DT_COMPLEX64"] = 8] = "DT_COMPLEX64";
    DataType[DataType["DT_INT64"] = 9] = "DT_INT64";
    DataType[DataType["DT_BOOL"] = 10] = "DT_BOOL";
    DataType[DataType["DT_QINT8"] = 11] = "DT_QINT8";
    DataType[DataType["DT_QUINT8"] = 12] = "DT_QUINT8";
    DataType[DataType["DT_QINT32"] = 13] = "DT_QINT32";
    DataType[DataType["DT_BFLOAT16"] = 14] = "DT_BFLOAT16";
    DataType[DataType["DT_FLOAT_REF"] = 101] = "DT_FLOAT_REF";
    DataType[DataType["DT_DOUBLE_REF"] = 102] = "DT_DOUBLE_REF";
    DataType[DataType["DT_INT32_REF"] = 103] = "DT_INT32_REF";
    DataType[DataType["DT_UINT8_REF"] = 104] = "DT_UINT8_REF";
    DataType[DataType["DT_INT16_REF"] = 105] = "DT_INT16_REF";
    DataType[DataType["DT_INT8_REF"] = 106] = "DT_INT8_REF";
    DataType[DataType["DT_STRING_REF"] = 107] = "DT_STRING_REF";
    DataType[DataType["DT_COMPLEX64_REF"] = 108] = "DT_COMPLEX64_REF";
    DataType[DataType["DT_INT64_REF"] = 109] = "DT_INT64_REF";
    DataType[DataType["DT_BOOL_REF"] = 110] = "DT_BOOL_REF";
    DataType[DataType["DT_QINT8_REF"] = 111] = "DT_QINT8_REF";
    DataType[DataType["DT_QUINT8_REF"] = 112] = "DT_QUINT8_REF";
    DataType[DataType["DT_QINT32_REF"] = 113] = "DT_QINT32_REF";
    DataType[DataType["DT_BFLOAT16_REF"] = 114] = "DT_BFLOAT16_REF";
})(DataType || (DataType = {}));
export var SaverDef;
(function (SaverDef) {
    /** CheckpointFormatVersion enum. */
    let CheckpointFormatVersion;
    (function (CheckpointFormatVersion) {
        CheckpointFormatVersion[CheckpointFormatVersion["LEGACY"] = 0] = "LEGACY";
        CheckpointFormatVersion[CheckpointFormatVersion["V1"] = 1] = "V1";
        CheckpointFormatVersion[CheckpointFormatVersion["V2"] = 2] = "V2";
    })(CheckpointFormatVersion = SaverDef.CheckpointFormatVersion || (SaverDef.CheckpointFormatVersion = {}));
})(SaverDef || (SaverDef = {}));
//# sourceMappingURL=compiled_api.js.map