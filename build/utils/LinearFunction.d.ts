import { NumberSpace } from './LinearTransform';
export declare type LinearFunction = {
    a: number;
    b: number;
};
export declare const wordSpaceTexelFunction: (numberSpace: NumberSpace) => LinearFunction;
