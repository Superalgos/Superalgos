export declare type GLSL = {
    version: string;
    attribute: string;
    varyingVs: string;
    varyingFs: string;
    texture2D: string;
    output: string;
    defineOutput: string;
    defineSpecialNaN: string;
    defineSpecialInf: string;
    defineRound: string;
};
export declare function getGlslDifferences(): GLSL;
