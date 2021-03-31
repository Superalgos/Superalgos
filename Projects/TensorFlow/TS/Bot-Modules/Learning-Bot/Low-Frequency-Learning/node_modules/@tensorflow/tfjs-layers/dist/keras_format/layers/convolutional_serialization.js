/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
// We can't easily extract a string[] from the string union type, but we can
// recapitulate the list, enforcing at compile time that the values are valid.
/**
 * A string array of valid ConvolutionalLayer class names.
 *
 * This is guaranteed to match the `ConvolutionalLayerClassName` union type.
 */
export const convolutionalLayerClassNames = [
    'Conv1D',
    'Conv2D',
    'Conv2DTranspose',
    'Cropping2D',
    'SeparableConv2D',
    'UpSampling2D',
];
//# sourceMappingURL=convolutional_serialization.js.map