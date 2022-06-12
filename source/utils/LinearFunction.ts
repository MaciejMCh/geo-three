import { LinearSpace } from './LinearTransform';

export type LinearFunction = {
    a: number;
    b: number;
};

export const wordSpaceTexelFunction = (linearSpace: LinearSpace): LinearFunction => {
    const diff = linearSpace.lowerBound - linearSpace.upperBound;
    const a = -1 / diff;
    const b = linearSpace.lowerBound / diff;
    return { a, b };
};
