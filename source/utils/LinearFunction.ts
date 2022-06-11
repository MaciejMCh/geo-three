import { NumberSpace } from './LinearTransform';

export type LinearFunction = {
    a: number;
    b: number;
};

export const wordSpaceTexelFunction = (numberSpace: NumberSpace): LinearFunction => {
    const diff = numberSpace.min - numberSpace.max;
    const a = -1 / diff;
    const b = numberSpace.min / diff;
    return { a, b };
};
