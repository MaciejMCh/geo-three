import { LinearSpace } from './LinearTransform';
export declare type LinearFunction = {
    a: number;
    b: number;
};
export declare type LinearTransform2d = {
    x: LinearFunction;
    y: LinearFunction;
};
export declare const wordSpaceTexelFunction: (linearSpace: LinearSpace) => LinearFunction;
