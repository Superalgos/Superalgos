import { getCoordsDataType } from './shader_compiler';
export class GatherNDProgram {
    constructor(sliceDim, strides, shape) {
        this.sliceDim = sliceDim;
        this.strides = strides;
        this.variableNames = ['x', 'indices'];
        this.outputShape = shape;
        const stridesType = getCoordsDataType(strides.length);
        const dtype = getCoordsDataType(shape.length);
        const strideString = this.sliceDim > 1 ? 'strides[j]' : 'strides';
        this.userCode = `
        ${stridesType} strides = ${stridesType}(${this.strides});
         void main() {
          ${dtype} coords = getOutputCoords();
          int flattenIndex = 0;
          for (int j = 0; j < ${this.sliceDim}; j++) {
            int index = round(getIndices(coords[0], j));
            flattenIndex += index * ${strideString};
          }
          setOutput(getX(flattenIndex, coords[1]));
        }
      `;
    }
}
//# sourceMappingURL=gather_nd_gpu.js.map