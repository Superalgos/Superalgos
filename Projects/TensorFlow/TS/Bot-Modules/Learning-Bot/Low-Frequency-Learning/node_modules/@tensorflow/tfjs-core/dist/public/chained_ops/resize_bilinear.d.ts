import { Rank } from '../../types';
declare module '../../tensor' {
    interface Tensor<R extends Rank = Rank> {
        resizeBilinear<T extends Tensor3D | Tensor4D>(newShape2D: [number, number], alignCorners?: boolean, halfPixelCenters?: boolean): T;
    }
}
