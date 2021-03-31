import { getCoordsDataType } from './shader_compiler';
export class CumSumProgram {
    constructor(shape, exclusive, reverse) {
        this.variableNames = ['x'];
        this.outputShape = shape;
        const rank = shape.length;
        const val = exclusive ? '0.0' : `getX(${getCoords(rank, 'coords')})`;
        const length = shape[shape.length - 1];
        let condition = '';
        let idxString = '';
        // When exclusive is set, the cumsum op becomes roll op that copies the
        // value from the previous index based on the direction specified by the
        // reverse flag.
        if (exclusive) {
            condition = reverse ? `end != ${length - 1}` : 'end != 0';
            idxString = reverse ? 'end + 1' : 'end - 1';
        }
        else {
            condition = reverse ? `end + pow2 < ${length}` : 'end >= pow2';
            idxString = (reverse ? 'end + pow2' : 'end - pow2');
        }
        this.userCode = `
      uniform float index;
      void main() {
        ${getCoordsDataType(rank)} coords = getOutputCoords();
        int end = ${getFinalCoord(rank, 'coords')};
        float val = ${val};
        int pow2 = int(pow(2.0, index));
        if (${condition}) {
          int idx = ${idxString};
          ${getFinalCoord(rank, 'coords')} = idx;
          val += getX(${getCoords(rank, 'coords')});
        }
        setOutput(val);
      }
    `;
    }
    getCustomSetupFunc(index) {
        return (gpgpu, webGLProgram) => {
            if (this.index == null) {
                this.index = gpgpu.getUniformLocation(webGLProgram, 'index');
            }
            gpgpu.gl.uniform1f(this.index, index);
        };
    }
}
function getCoords(rank, name) {
    if (rank === 1) {
        return `${name}`;
    }
    else if (rank === 2) {
        return `${name}.x, ${name}.y`;
    }
    else if (rank === 3) {
        return `${name}.x, ${name}.y, ${name}.z`;
    }
    else if (rank === 4) {
        return `${name}.x, ${name}.y, ${name}.z, ${name}.w`;
    }
    else {
        throw Error(`Cumulative sum for rank ${rank} is not yet supported`);
    }
}
function getFinalCoord(rank, name) {
    if (rank === 1) {
        return `${name}`;
    }
    else if (rank === 2) {
        return `${name}.y`;
    }
    else if (rank === 3) {
        return `${name}.z`;
    }
    else if (rank === 4) {
        return `${name}.w`;
    }
    else {
        throw Error(`Cumulative sum for rank ${rank} is not yet supported`);
    }
}
//# sourceMappingURL=cumsum_gpu.js.map