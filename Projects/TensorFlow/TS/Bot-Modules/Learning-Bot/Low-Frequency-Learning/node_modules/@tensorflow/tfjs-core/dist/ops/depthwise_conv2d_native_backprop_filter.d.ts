import { Tensor3D, Tensor4D } from '../tensor';
import { ExplicitPadding } from './conv_util';
declare function depthwiseConv2dNativeBackpropFilter_<T extends Tensor3D | Tensor4D>(x: T, dy: T, filterShape: [number, number, number, number], strides: [number, number] | number, pad: 'valid' | 'same' | number | ExplicitPadding, dilations?: [number, number] | number, dimRoundingMode?: 'floor' | 'round' | 'ceil'): Tensor4D;
export declare const depthwiseConv2dNativeBackpropFilter: typeof depthwiseConv2dNativeBackpropFilter_;
export {};
