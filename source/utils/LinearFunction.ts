export type LinearFunction = {
    a: number;
    b: number;
};

export const wordSpaceTexelFunction = (lower: number, upper: number): LinearFunction => {
    const diff = lower - upper;
    const a = -1 / diff;
    const b = lower / diff;
    return { a, b };
};
