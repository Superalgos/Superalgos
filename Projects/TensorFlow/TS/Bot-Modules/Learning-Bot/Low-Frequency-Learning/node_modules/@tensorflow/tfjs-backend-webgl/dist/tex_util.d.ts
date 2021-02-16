/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
import { backend_util, DataId, DataType, TensorInfo } from '@tensorflow/tfjs-core';
export declare enum PackingScheme {
    /**
     * All values in a single texel are densely packed without any constraints.
     *
     * This is how the shader encodes a tensor with shape = [2, 3, 4]
     * (indices are [batch, row, col]).
     *
     * 000|001   010|011   020|021
     * -------   -------   -------
     * 002|003   012|013   022|023
     *
     * 100|101   110|111   120|121
     * -------   -------   -------
     * 102|103   112|113   122|123
     *
     */
    DENSE = 0,
    /**
     * Single texels contain only values from the same batch, and from adjacent
     * rows and columns.
     *
     * This is how the shader encodes a tensor with shape = [2, 3, 5]
     * (indices are [batch, row, col]).
     *
     * 000|001   002|003   004|xxx   020|021   022|023   024|xxx
     * -------   -------   -------   -------   -------   -------
     * 010|011   012|013   014|xxx   xxx|xxx   xxx|xxx   xxx|xxx
     *
     * 100|101   102|103   104|xxx   120|121   122|123   124|xxx
     * -------   -------   -------   -------   -------   -------
     * 110|111   112|113   114|xxx   xxx|xxx   xxx|xxx   xxx|xxx
     *
     */
    SHARED_BATCH = 1
}
export declare enum TextureUsage {
    RENDER = 0,
    UPLOAD = 1,
    PIXELS = 2,
    DOWNLOAD = 3
}
export declare enum PhysicalTextureType {
    UNPACKED_FLOAT16 = 0,
    UNPACKED_FLOAT32 = 1,
    PACKED_4X1_UNSIGNED_BYTE = 2,
    PACKED_2X2_FLOAT32 = 3,
    PACKED_2X2_FLOAT16 = 4
}
export interface TextureData {
    shape: number[];
    dtype: DataType;
    values?: backend_util.BackendValues;
    texture?: WebGLTexture;
    complexTensorInfos?: {
        real: TensorInfo;
        imag: TensorInfo;
    };
    /** [rows, columns] shape of the texture. */
    texShape?: [number, number];
    usage?: TextureUsage;
    isPacked?: boolean;
    refCount: number;
    complexParentRefCount: number;
    slice?: {
        flatOffset: number;
        origDataId: DataId;
    };
}
export declare function getUnpackedMatrixTextureShapeWidthHeight(rows: number, columns: number): [number, number];
export declare function getUnpackedArraySizeFromMatrixSize(matrixSize: number, channelsPerTexture: number): number;
export declare function getColorMatrixTextureShapeWidthHeight(rows: number, columns: number): [number, number];
/**
 * Get shape for densely packed RGBA texture.
 */
export declare function getDenseTexShape(shape: number[]): [number, number];
export declare function getMatrixSizeFromUnpackedArraySize(unpackedSize: number, channelsPerTexture: number): number;
export declare function decodeMatrixFromUnpackedColorRGBAArray(unpackedArray: Float32Array, matrix: Float32Array, channels: number): void;
export declare function getPackedMatrixTextureShapeWidthHeight(rows: number, columns: number): [number, number];
export declare function getPackedRGBAArraySizeFromMatrixShape(rows: number, columns: number): number;
export interface TextureConfig {
    internalFormatFloat: number;
    textureFormatFloat: number;
    internalFormatPackedHalfFloat: number;
    internalFormatHalfFloat: number;
    internalFormatPackedFloat: number;
    downloadTextureFormat: number;
    downloadUnpackNumChannels: number;
    defaultNumChannels: number;
    textureTypeHalfFloat: number;
    textureTypeFloat: number;
}
export declare function getTextureConfig(gl: WebGLRenderingContext, textureHalfFloatExtension?: any): TextureConfig;
