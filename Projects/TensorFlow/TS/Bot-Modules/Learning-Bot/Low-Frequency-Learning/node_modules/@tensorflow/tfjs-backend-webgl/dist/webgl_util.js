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
import { env, util } from '@tensorflow/tfjs-core';
import { getWebGLContext } from './canvas_util';
import { getTextureConfig } from './tex_util';
export function callAndCheck(gl, func) {
    const returnValue = func();
    if (env().getBool('DEBUG')) {
        checkWebGLError(gl);
    }
    return returnValue;
}
function checkWebGLError(gl) {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) {
        throw new Error('WebGL Error: ' + getWebGLErrorMessage(gl, error));
    }
}
// https://en.wikipedia.org/wiki/Half-precision_floating-point_format
const MIN_FLOAT16 = 5.96e-8;
const MAX_FLOAT16 = 65504;
export function canBeRepresented(num) {
    if (env().getBool('WEBGL_RENDER_FLOAT32_ENABLED') || num === 0 ||
        (MIN_FLOAT16 < Math.abs(num) && Math.abs(num) < MAX_FLOAT16)) {
        return true;
    }
    return false;
}
export function getWebGLErrorMessage(gl, status) {
    switch (status) {
        case gl.NO_ERROR:
            return 'NO_ERROR';
        case gl.INVALID_ENUM:
            return 'INVALID_ENUM';
        case gl.INVALID_VALUE:
            return 'INVALID_VALUE';
        case gl.INVALID_OPERATION:
            return 'INVALID_OPERATION';
        case gl.INVALID_FRAMEBUFFER_OPERATION:
            return 'INVALID_FRAMEBUFFER_OPERATION';
        case gl.OUT_OF_MEMORY:
            return 'OUT_OF_MEMORY';
        case gl.CONTEXT_LOST_WEBGL:
            return 'CONTEXT_LOST_WEBGL';
        default:
            return `Unknown error code ${status}`;
    }
}
export function getExtensionOrThrow(gl, extensionName) {
    return throwIfNull(gl, () => gl.getExtension(extensionName), 'Extension "' + extensionName + '" not supported on this browser.');
}
export function createVertexShader(gl, vertexShaderSource) {
    const vertexShader = throwIfNull(gl, () => gl.createShader(gl.VERTEX_SHADER), 'Unable to create vertex WebGLShader.');
    callAndCheck(gl, () => gl.shaderSource(vertexShader, vertexShaderSource));
    callAndCheck(gl, () => gl.compileShader(vertexShader));
    if (gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS) === false) {
        console.log(gl.getShaderInfoLog(vertexShader));
        throw new Error('Failed to compile vertex shader.');
    }
    return vertexShader;
}
export function createFragmentShader(gl, fragmentShaderSource) {
    const fragmentShader = throwIfNull(gl, () => gl.createShader(gl.FRAGMENT_SHADER), 'Unable to create fragment WebGLShader.');
    callAndCheck(gl, () => gl.shaderSource(fragmentShader, fragmentShaderSource));
    callAndCheck(gl, () => gl.compileShader(fragmentShader));
    if (gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS) === false) {
        logShaderSourceAndInfoLog(fragmentShaderSource, gl.getShaderInfoLog(fragmentShader));
        throw new Error('Failed to compile fragment shader.');
    }
    return fragmentShader;
}
const lineNumberRegex = /ERROR: [0-9]+:([0-9]+):/g;
function logShaderSourceAndInfoLog(shaderSource, shaderInfoLog) {
    const lineNumberRegexResult = lineNumberRegex.exec(shaderInfoLog);
    if (lineNumberRegexResult == null) {
        console.log(`Couldn't parse line number in error: ${shaderInfoLog}`);
        console.log(shaderSource);
        return;
    }
    const lineNumber = +lineNumberRegexResult[1];
    const shaderLines = shaderSource.split('\n');
    const pad = shaderLines.length.toString().length + 2;
    const linesWithLineNumbers = shaderLines.map((line, lineNumber) => util.rightPad((lineNumber + 1).toString(), pad) + line);
    let maxLineLength = 0;
    for (let i = 0; i < linesWithLineNumbers.length; i++) {
        maxLineLength = Math.max(linesWithLineNumbers[i].length, maxLineLength);
    }
    const beforeErrorLines = linesWithLineNumbers.slice(0, lineNumber - 1);
    const errorLine = linesWithLineNumbers.slice(lineNumber - 1, lineNumber);
    const afterErrorLines = linesWithLineNumbers.slice(lineNumber);
    console.log(beforeErrorLines.join('\n'));
    console.log(shaderInfoLog.split('\n')[0]);
    console.log(`%c ${util.rightPad(errorLine[0], maxLineLength)}`, 'border:1px solid red; background-color:#e3d2d2; color:#a61717');
    console.log(afterErrorLines.join('\n'));
}
export function createProgram(gl) {
    return throwIfNull(gl, () => gl.createProgram(), 'Unable to create WebGLProgram.');
}
export function linkProgram(gl, program) {
    callAndCheck(gl, () => gl.linkProgram(program));
    if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Failed to link vertex and fragment shaders.');
    }
}
export function validateProgram(gl, program) {
    callAndCheck(gl, () => gl.validateProgram(program));
    if (gl.getProgramParameter(program, gl.VALIDATE_STATUS) === false) {
        console.log(gl.getProgramInfoLog(program));
        throw new Error('Shader program validation failed.');
    }
}
export function createStaticVertexBuffer(gl, data) {
    const buffer = throwIfNull(gl, () => gl.createBuffer(), 'Unable to create WebGLBuffer');
    callAndCheck(gl, () => gl.bindBuffer(gl.ARRAY_BUFFER, buffer));
    callAndCheck(gl, () => gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW));
    return buffer;
}
export function createStaticIndexBuffer(gl, data) {
    const buffer = throwIfNull(gl, () => gl.createBuffer(), 'Unable to create WebGLBuffer');
    callAndCheck(gl, () => gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer));
    callAndCheck(gl, () => gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW));
    return buffer;
}
export function getNumChannels() {
    if (env().getNumber('WEBGL_VERSION') === 2) {
        return 1;
    }
    return 4;
}
export function createTexture(gl) {
    return throwIfNull(gl, () => gl.createTexture(), 'Unable to create WebGLTexture.');
}
export function validateTextureSize(width, height) {
    const maxTextureSize = env().getNumber('WEBGL_MAX_TEXTURE_SIZE');
    if ((width <= 0) || (height <= 0)) {
        const requested = `[${width}x${height}]`;
        throw new Error('Requested texture size ' + requested + ' is invalid.');
    }
    if ((width > maxTextureSize) || (height > maxTextureSize)) {
        const requested = `[${width}x${height}]`;
        const max = `[${maxTextureSize}x${maxTextureSize}]`;
        throw new Error('Requested texture size ' + requested +
            ' greater than WebGL maximum on this browser / GPU ' + max + '.');
    }
}
export function createFramebuffer(gl) {
    return throwIfNull(gl, () => gl.createFramebuffer(), 'Unable to create WebGLFramebuffer.');
}
export function bindVertexBufferToProgramAttribute(gl, program, attribute, buffer, arrayEntriesPerItem, itemStrideInBytes, itemOffsetInBytes) {
    const loc = gl.getAttribLocation(program, attribute);
    if (loc === -1) {
        // The GPU compiler decided to strip out this attribute because it's unused,
        // thus no need to bind.
        return false;
    }
    callAndCheck(gl, () => gl.bindBuffer(gl.ARRAY_BUFFER, buffer));
    callAndCheck(gl, () => gl.vertexAttribPointer(loc, arrayEntriesPerItem, gl.FLOAT, false, itemStrideInBytes, itemOffsetInBytes));
    callAndCheck(gl, () => gl.enableVertexAttribArray(loc));
    return true;
}
export function bindTextureUnit(gl, texture, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, () => gl.activeTexture(gl.TEXTURE0 + textureUnit));
    callAndCheck(gl, () => gl.bindTexture(gl.TEXTURE_2D, texture));
}
export function unbindTextureUnit(gl, textureUnit) {
    validateTextureUnit(gl, textureUnit);
    callAndCheck(gl, () => gl.activeTexture(gl.TEXTURE0 + textureUnit));
    callAndCheck(gl, () => gl.bindTexture(gl.TEXTURE_2D, null));
}
export function getProgramUniformLocationOrThrow(gl, program, uniformName) {
    return throwIfNull(gl, () => gl.getUniformLocation(program, uniformName), 'uniform "' + uniformName + '" not present in program.');
}
export function getProgramUniformLocation(gl, program, uniformName) {
    return gl.getUniformLocation(program, uniformName);
}
export function bindTextureToProgramUniformSampler(gl, texture, uniformSamplerLocation, textureUnit) {
    callAndCheck(gl, () => bindTextureUnit(gl, texture, textureUnit));
    callAndCheck(gl, () => gl.uniform1i(uniformSamplerLocation, textureUnit));
}
export function bindCanvasToFramebuffer(gl) {
    callAndCheck(gl, () => gl.bindFramebuffer(gl.FRAMEBUFFER, null));
    callAndCheck(gl, () => gl.viewport(0, 0, gl.canvas.width, gl.canvas.height));
    callAndCheck(gl, () => gl.scissor(0, 0, gl.canvas.width, gl.canvas.height));
}
export function bindColorTextureToFramebuffer(gl, texture, framebuffer) {
    callAndCheck(gl, () => gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer));
    callAndCheck(gl, () => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0));
}
export function unbindColorTextureFromFramebuffer(gl, framebuffer) {
    callAndCheck(gl, () => gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer));
    callAndCheck(gl, () => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0));
}
export function validateFramebuffer(gl) {
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Error binding framebuffer: ' + getFramebufferErrorMessage(gl, status));
    }
}
export function getFramebufferErrorMessage(gl, status) {
    switch (status) {
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            return 'FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT';
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            return 'FRAMEBUFFER_INCOMPLETE_DIMENSIONS';
        case gl.FRAMEBUFFER_UNSUPPORTED:
            return 'FRAMEBUFFER_UNSUPPORTED';
        default:
            return `unknown error ${status}`;
    }
}
function throwIfNull(gl, returnTOrNull, failureMessage) {
    const tOrNull = callAndCheck(gl, () => returnTOrNull());
    if (tOrNull == null) {
        throw new Error(failureMessage);
    }
    return tOrNull;
}
function validateTextureUnit(gl, textureUnit) {
    const maxTextureUnit = gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS - 1;
    const glTextureUnit = textureUnit + gl.TEXTURE0;
    if (glTextureUnit < gl.TEXTURE0 || glTextureUnit > maxTextureUnit) {
        const textureUnitRange = `[gl.TEXTURE0, gl.TEXTURE${maxTextureUnit}]`;
        throw new Error(`textureUnit must be in ${textureUnitRange}.`);
    }
}
export function getBatchDim(shape, dimsToSkip = 2) {
    return util.sizeFromShape(shape.slice(0, shape.length - dimsToSkip));
}
export function getRowsCols(shape) {
    if (shape.length === 0) {
        throw Error('Cannot get rows and columns of an empty shape array.');
    }
    return [
        shape.length > 1 ? shape[shape.length - 2] : 1, shape[shape.length - 1]
    ];
}
export function getShapeAs3D(shape) {
    let shapeAs3D = [1, 1, 1];
    const isScalar = shape.length === 0 || (shape.length === 1 && shape[0] === 1);
    if (!isScalar) {
        shapeAs3D =
            [getBatchDim(shape), ...getRowsCols(shape)];
    }
    return shapeAs3D;
}
export function getTextureShapeFromLogicalShape(logShape, isPacked = false) {
    let maxTexSize = env().getNumber('WEBGL_MAX_TEXTURE_SIZE');
    if (isPacked) {
        maxTexSize = maxTexSize * 2;
        // This logic ensures we accurately count the number of packed texels needed
        // to accommodate the tensor. We can only pack values in the same texel if
        // they are from adjacent pairs of rows/cols within the same batch. So if a
        // tensor has 3 rows, we pretend it has 4 rows in order to account for the
        // fact that the texels containing the third row are half empty.
        logShape = logShape.map((d, i) => i >= logShape.length - 2 ?
            util.nearestLargerEven(logShape[i]) :
            logShape[i]);
        // Packed texture height is at least 2 (the channel height of a single
        // texel).
        if (logShape.length === 1) {
            logShape = [2, logShape[0]];
        }
    }
    // If logical shape is 2, we don't squeeze, since we want to match physical.
    if (logShape.length !== 2) {
        const squeezeResult = util.squeezeShape(logShape);
        logShape = squeezeResult.newShape;
    }
    let size = util.sizeFromShape(logShape);
    if (logShape.length <= 1 && size <= maxTexSize) {
        return [1, size];
    }
    else if (logShape.length === 2 && logShape[0] <= maxTexSize &&
        logShape[1] <= maxTexSize) {
        return logShape;
    }
    else if (logShape.length === 3 && logShape[0] * logShape[1] <= maxTexSize &&
        logShape[2] <= maxTexSize) {
        return [logShape[0] * logShape[1], logShape[2]];
    }
    else if (logShape.length === 3 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2]];
    }
    else if (logShape.length === 4 &&
        logShape[0] * logShape[1] * logShape[2] <= maxTexSize &&
        logShape[3] <= maxTexSize) {
        return [logShape[0] * logShape[1] * logShape[2], logShape[3]];
    }
    else if (logShape.length === 4 && logShape[0] <= maxTexSize &&
        logShape[1] * logShape[2] * logShape[3] <= maxTexSize) {
        return [logShape[0], logShape[1] * logShape[2] * logShape[3]];
    }
    else {
        if (isPacked) {
            // For packed textures size equals the number of channels required to
            // accommodate the texture data. However in order to squarify such that
            // inner dimensions stay even, we rewrite size to equal the number of
            // texels. Then in the return statement we rehydrate the squarified
            // dimensions to channel units.
            const batchDim = getBatchDim(logShape);
            let rows = 2, cols = 2;
            if (logShape.length) {
                [rows, cols] = getRowsCols(logShape);
            }
            size = batchDim * (rows / 2) * (cols / 2);
            return util.sizeToSquarishShape(size).map(d => d * 2);
        }
        return util.sizeToSquarishShape(size);
    }
}
function isEven(n) {
    return n % 2 === 0;
}
/**
 * This determines whether reshaping a packed texture requires rearranging
 * the data within the texture, assuming 2x2 packing.
 */
export function isReshapeFree(shape1, shape2) {
    shape1 = shape1.slice(-2);
    shape2 = shape2.slice(-2);
    if (util.arraysEqual(shape1, shape2)) {
        return true;
    }
    if (!shape1.length || !shape2.length) { // One of the shapes is a scalar.
        return true;
    }
    if (shape1[0] === 0 || shape1[1] === 0 || shape2[0] === 0 ||
        shape2[1] === 0) {
        return true;
    }
    if (shape1.length !== shape2.length) { // One of the shapes is a vector.
        const shape1Cols = shape1.slice(-1)[0];
        const shape2Cols = shape2.slice(-1)[0];
        if (shape1Cols === shape2Cols) {
            return true;
        }
        if (isEven(shape1Cols) && isEven(shape2Cols) &&
            (shape1[0] === 1 || shape2[0] === 1)) {
            return true;
        }
    }
    return shape1[1] === shape2[1] && isEven(shape1[0]) && isEven(shape2[0]);
}
// We cache webgl params because the environment gets reset between
// unit tests and we don't want to constantly query the WebGLContext for
// MAX_TEXTURE_SIZE.
let MAX_TEXTURE_SIZE;
let MAX_TEXTURES_IN_SHADER;
export function getWebGLMaxTextureSize(webGLVersion) {
    if (MAX_TEXTURE_SIZE == null) {
        const gl = getWebGLContext(webGLVersion);
        MAX_TEXTURE_SIZE = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    }
    return MAX_TEXTURE_SIZE;
}
export function resetMaxTextureSize() {
    MAX_TEXTURE_SIZE = null;
}
export function resetMaxTexturesInShader() {
    MAX_TEXTURES_IN_SHADER = null;
}
export function getMaxTexturesInShader(webGLVersion) {
    if (MAX_TEXTURES_IN_SHADER == null) {
        const gl = getWebGLContext(webGLVersion);
        MAX_TEXTURES_IN_SHADER = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    }
    // We cap at 16 to avoid spurious runtime "memory exhausted" error.
    return Math.min(16, MAX_TEXTURES_IN_SHADER);
}
export function getWebGLDisjointQueryTimerVersion(webGLVersion) {
    if (webGLVersion === 0) {
        return 0;
    }
    let queryTimerVersion;
    const gl = getWebGLContext(webGLVersion);
    if (hasExtension(gl, 'EXT_disjoint_timer_query_webgl2') &&
        webGLVersion === 2) {
        queryTimerVersion = 2;
    }
    else if (hasExtension(gl, 'EXT_disjoint_timer_query')) {
        queryTimerVersion = 1;
    }
    else {
        queryTimerVersion = 0;
    }
    return queryTimerVersion;
}
export function hasExtension(gl, extensionName) {
    const ext = gl.getExtension(extensionName);
    return ext != null;
}
export function isWebGLVersionEnabled(webGLVersion) {
    try {
        const gl = getWebGLContext(webGLVersion);
        if (gl != null) {
            return true;
        }
    }
    catch (e) {
        console.log('Error when getting WebGL context: ', e);
        return false;
    }
    return false;
}
export function isCapableOfRenderingToFloatTexture(webGLVersion) {
    if (webGLVersion === 0) {
        return false;
    }
    const gl = getWebGLContext(webGLVersion);
    if (webGLVersion === 1) {
        if (!hasExtension(gl, 'OES_texture_float')) {
            return false;
        }
    }
    else {
        if (!hasExtension(gl, 'EXT_color_buffer_float')) {
            return false;
        }
    }
    const isFrameBufferComplete = createFloatTextureAndBindToFramebuffer(gl);
    return isFrameBufferComplete;
}
/**
 * Check if we can download values from a float/half-float texture.
 *
 * Note that for performance reasons we use binding a texture to a framebuffer
 * as a proxy for ability to download float values later using readPixels. The
 * texture params of this texture will not match those in readPixels exactly
 * but if we are unable to bind some kind of float texture to the frameBuffer
 * then we definitely will not be able to read float values from it.
 */
export function isDownloadFloatTextureEnabled(webGLVersion) {
    if (webGLVersion === 0) {
        return false;
    }
    const gl = getWebGLContext(webGLVersion);
    if (webGLVersion === 1) {
        if (!hasExtension(gl, 'OES_texture_float')) {
            return false;
        }
        if (!hasExtension(gl, 'WEBGL_color_buffer_float')) {
            return false;
        }
    }
    else {
        if (hasExtension(gl, 'EXT_color_buffer_float')) {
            return createFloatTextureAndBindToFramebuffer(gl);
        }
        const COLOR_BUFFER_HALF_FLOAT = 'EXT_color_buffer_half_float';
        if (hasExtension(gl, COLOR_BUFFER_HALF_FLOAT)) {
            const textureHalfFloatExtension = gl.getExtension(COLOR_BUFFER_HALF_FLOAT);
            return createHalfFloatTextureAndBindToFramebuffer(gl, textureHalfFloatExtension);
        }
        return false;
    }
    const isFrameBufferComplete = createFloatTextureAndBindToFramebuffer(gl);
    return isFrameBufferComplete;
}
function createFloatTextureAndBindToFramebuffer(gl) {
    const texConfig = getTextureConfig(gl);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const width = 1;
    const height = 1;
    gl.texImage2D(gl.TEXTURE_2D, 0, texConfig.internalFormatFloat, width, height, 0, texConfig.textureFormatFloat, texConfig.textureTypeFloat, null);
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const isFrameBufferComplete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(frameBuffer);
    return isFrameBufferComplete;
}
function createHalfFloatTextureAndBindToFramebuffer(
// tslint:disable-next-line:no-any
gl, textureHalfFloatExtension) {
    const texConfig = getTextureConfig(gl, textureHalfFloatExtension);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const width = 1;
    const height = 1;
    gl.texImage2D(gl.TEXTURE_2D, 0, texConfig.internalFormatHalfFloat, width, height, 0, texConfig.textureFormatFloat, texConfig.textureTypeHalfFloat, null);
    const frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const isFrameBufferComplete = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(frameBuffer);
    return isFrameBufferComplete;
}
export function isWebGLFenceEnabled(webGLVersion) {
    if (webGLVersion !== 2) {
        return false;
    }
    const gl = getWebGLContext(webGLVersion);
    // tslint:disable-next-line:no-any
    const isEnabled = gl.fenceSync != null;
    return isEnabled;
}
export function assertNotComplex(tensor, opName) {
    if (!Array.isArray(tensor)) {
        tensor = [tensor];
    }
    tensor.forEach(t => {
        if (t != null) {
            util.assert(t.dtype !== 'complex64', () => `${opName} does not support complex64 tensors ` +
                'in the WebGL backend.');
        }
    });
}
//# sourceMappingURL=webgl_util.js.map