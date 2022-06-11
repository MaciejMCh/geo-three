import { Geoposition } from "../nodes/primitive";
export declare type NumberSpace = {
    min: number;
    max: number;
};
export declare const numberSpace: {
    frame: NumberSpace;
    geometryWorldTexels: (vertices: Geoposition[]) => {
        x: NumberSpace;
        y: NumberSpace;
    };
};
