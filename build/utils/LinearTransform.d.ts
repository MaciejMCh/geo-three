import { Geoposition } from '../nodes/primitive';
export declare class LinearSpace {
    readonly lowerBound: number;
    readonly upperBound: number;
    private _size?;
    get size(): number;
    constructor(lowerBound: number, upperBound: number);
    convert: (value: number, to: LinearSpace) => number;
}
export declare type LinearSpace2d = {
    x: LinearSpace;
    y: LinearSpace;
};
export declare const numberSpace: {
    frame: LinearSpace;
    frame2d: LinearSpace2d;
    geometryWorldTexels: (vertices: Geoposition[]) => LinearSpace2d;
};
export declare const transform: {
    vertices: (vertices: Geoposition[], from: LinearSpace2d, to: LinearSpace2d) => {
        x: number;
        y: number;
    }[];
};
