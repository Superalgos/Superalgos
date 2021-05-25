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
import { env } from '@tensorflow/tfjs-core';
import { FromPixels } from '@tensorflow/tfjs-core';
import { TextureUsage } from '../tex_util';
import { FromPixelsProgram } from './FromPixels_utils/from_pixels_gpu';
import { FromPixelsPackedProgram } from './FromPixels_utils/from_pixels_packed_gpu';
export const fromPixelsConfig = {
    kernelName: FromPixels,
    backendName: 'webgl',
    kernelFunc: fromPixels,
};
let fromPixels2DContext;
function fromPixels(args) {
    const { inputs, backend, attrs } = args;
    let { pixels } = inputs;
    const { numChannels } = attrs;
    const isVideo = typeof (HTMLVideoElement) !== 'undefined' &&
        pixels instanceof HTMLVideoElement;
    const isImage = typeof (HTMLImageElement) !== 'undefined' &&
        pixels instanceof HTMLImageElement;
    const isImageBitmap = typeof (ImageBitmap) !== 'undefined' &&
        pixels instanceof ImageBitmap;
    const [width, height] = isVideo ?
        [
            pixels.videoWidth,
            pixels.videoHeight
        ] :
        [pixels.width, pixels.height];
    const texShape = [height, width];
    const outShape = [height, width, numChannels];
    if (isImage || isVideo || isImageBitmap) {
        if (fromPixels2DContext == null) {
            fromPixels2DContext = document.createElement('canvas').getContext('2d');
        }
        fromPixels2DContext.canvas.width = width;
        fromPixels2DContext.canvas.height = height;
        fromPixels2DContext.drawImage(pixels, 0, 0, width, height);
        pixels = fromPixels2DContext.canvas;
    }
    const tempPixelHandle = backend.makeTensorInfo(texShape, 'int32');
    // This is a byte texture with pixels.
    backend.texData.get(tempPixelHandle.dataId).usage = TextureUsage.PIXELS;
    backend.gpgpu.uploadPixelDataToTexture(backend.getTexture(tempPixelHandle.dataId), pixels);
    const program = env().getBool('WEBGL_PACK') ?
        new FromPixelsPackedProgram(outShape) :
        new FromPixelsProgram(outShape);
    const res = backend.runWebGLProgram(program, [tempPixelHandle], 'int32');
    backend.disposeData(tempPixelHandle.dataId);
    return res;
}
//# sourceMappingURL=FromPixels.js.map