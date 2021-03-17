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
import { GPGPUContext } from './gpgpu_context';
import { PhysicalTextureType, TextureConfig, TextureUsage } from './tex_util';
export declare class TextureManager {
    private gpgpu;
    private numUsedTextures;
    private numFreeTextures;
    private _numBytesAllocated;
    private _numBytesFree;
    private freeTextures;
    private logEnabled;
    private usedTextures;
    constructor(gpgpu: GPGPUContext);
    acquireTexture(shapeRC: [number, number], usage: TextureUsage, isPacked: boolean): WebGLTexture;
    releaseTexture(texture: WebGLTexture, shape: [number, number], logicalTexType: TextureUsage, isPacked: boolean): void;
    private log;
    readonly numBytesAllocated: number;
    readonly numBytesFree: number;
    getNumUsedTextures(): number;
    getNumFreeTextures(): number;
    dispose(): void;
}
export declare function computeBytes(shape: [number, number], physicalTexType: PhysicalTextureType, gl: WebGLRenderingContext, textureConfig: TextureConfig, isPacked: boolean): number;
