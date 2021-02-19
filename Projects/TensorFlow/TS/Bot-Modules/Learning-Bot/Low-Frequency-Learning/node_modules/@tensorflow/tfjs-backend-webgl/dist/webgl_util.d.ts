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
import { TensorInfo } from '@tensorflow/tfjs-core';
export declare function callAndCheck<T>(gl: WebGLRenderingContext, func: () => T): T;
export declare function canBeRepresented(num: number): boolean;
export declare function getWebGLErrorMessage(gl: WebGLRenderingContext, status: number): string;
export declare function getExtensionOrThrow(gl: WebGLRenderingContext, extensionName: string): {};
export declare function createVertexShader(gl: WebGLRenderingContext, vertexShaderSource: string): WebGLShader;
export declare function createFragmentShader(gl: WebGLRenderingContext, fragmentShaderSource: string): WebGLShader;
export declare function createProgram(gl: WebGLRenderingContext): WebGLProgram;
export declare function linkProgram(gl: WebGLRenderingContext, program: WebGLProgram): void;
export declare function validateProgram(gl: WebGLRenderingContext, program: WebGLProgram): void;
export declare function createStaticVertexBuffer(gl: WebGLRenderingContext, data: Float32Array): WebGLBuffer;
export declare function createStaticIndexBuffer(gl: WebGLRenderingContext, data: Uint16Array): WebGLBuffer;
export declare function getNumChannels(): number;
export declare function createTexture(gl: WebGLRenderingContext): WebGLTexture;
export declare function validateTextureSize(width: number, height: number): void;
export declare function createFramebuffer(gl: WebGLRenderingContext): WebGLFramebuffer;
export declare function bindVertexBufferToProgramAttribute(gl: WebGLRenderingContext, program: WebGLProgram, attribute: string, buffer: WebGLBuffer, arrayEntriesPerItem: number, itemStrideInBytes: number, itemOffsetInBytes: number): boolean;
export declare function bindTextureUnit(gl: WebGLRenderingContext, texture: WebGLTexture, textureUnit: number): void;
export declare function unbindTextureUnit(gl: WebGLRenderingContext, textureUnit: number): void;
export declare function getProgramUniformLocationOrThrow(gl: WebGLRenderingContext, program: WebGLProgram, uniformName: string): WebGLUniformLocation;
export declare function getProgramUniformLocation(gl: WebGLRenderingContext, program: WebGLProgram, uniformName: string): WebGLUniformLocation;
export declare function bindTextureToProgramUniformSampler(gl: WebGLRenderingContext, texture: WebGLTexture, uniformSamplerLocation: WebGLUniformLocation, textureUnit: number): void;
export declare function bindCanvasToFramebuffer(gl: WebGLRenderingContext): void;
export declare function bindColorTextureToFramebuffer(gl: WebGLRenderingContext, texture: WebGLTexture, framebuffer: WebGLFramebuffer): void;
export declare function unbindColorTextureFromFramebuffer(gl: WebGLRenderingContext, framebuffer: WebGLFramebuffer): void;
export declare function validateFramebuffer(gl: WebGLRenderingContext): void;
export declare function getFramebufferErrorMessage(gl: WebGLRenderingContext, status: number): string;
export declare function getBatchDim(shape: number[], dimsToSkip?: number): number;
export declare function getRowsCols(shape: number[]): [number, number];
export declare function getShapeAs3D(shape: number[]): [number, number, number];
export declare function getTextureShapeFromLogicalShape(logShape: number[], isPacked?: boolean): [number, number];
/**
 * This determines whether reshaping a packed texture requires rearranging
 * the data within the texture, assuming 2x2 packing.
 */
export declare function isReshapeFree(shape1: number[], shape2: number[]): boolean;
export declare function getWebGLMaxTextureSize(webGLVersion: number): number;
export declare function resetMaxTextureSize(): void;
export declare function resetMaxTexturesInShader(): void;
export declare function getMaxTexturesInShader(webGLVersion: number): number;
export declare function getWebGLDisjointQueryTimerVersion(webGLVersion: number): number;
export declare function hasExtension(gl: WebGLRenderingContext, extensionName: string): boolean;
export declare function isWebGLVersionEnabled(webGLVersion: 1 | 2): boolean;
export declare function isCapableOfRenderingToFloatTexture(webGLVersion: number): boolean;
/**
 * Check if we can download values from a float/half-float texture.
 *
 * Note that for performance reasons we use binding a texture to a framebuffer
 * as a proxy for ability to download float values later using readPixels. The
 * texture params of this texture will not match those in readPixels exactly
 * but if we are unable to bind some kind of float texture to the frameBuffer
 * then we definitely will not be able to read float values from it.
 */
export declare function isDownloadFloatTextureEnabled(webGLVersion: number): boolean;
export declare function isWebGLFenceEnabled(webGLVersion: number): boolean;
export declare function assertNotComplex(tensor: TensorInfo | TensorInfo[], opName: string): void;
