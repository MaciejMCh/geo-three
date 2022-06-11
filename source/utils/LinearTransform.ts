import { Geoposition } from "../nodes/primitive";

export type NumberSpace = {
    min: number;
    max: number;
};

export const numberSpace = {
    frame: { min: -1, max: 1 } as NumberSpace,
    geometryWorldTexels: (vertices: Geoposition[]): { x: NumberSpace; y: NumberSpace } => {
        const worldSpaceTexelsXs = vertices.map(vertex => vertex.worldTexel.x);
        const worldSpaceTexelsYs = vertices.map(vertex => vertex.worldTexel.y);
        const minX = Math.min(...worldSpaceTexelsXs);
        const maxX = Math.max(...worldSpaceTexelsXs);
        const minY = Math.min(...worldSpaceTexelsYs);
        const maxY = Math.max(...worldSpaceTexelsYs);
        
        return {
            x: { min: minX, max: maxX },
            y: { min: minY, max: maxY },
        };
    },
};
