import { Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';

export class LinearSpace {
    private _size?: number;

    get size() {
        if (this._size === undefined) {
            this._size = this.upperBound - this.lowerBound;
        }

        return this._size;
    }

    constructor(public readonly lowerBound: number, public readonly upperBound: number) {}

    convert = (value: number, to: LinearSpace) => {
        const progress = (this.upperBound - value) / this.size;
        return to.lowerBound + (to.size * progress);
    };
}

export class LinearSpace2d {
    private _ratio?: number;

    get ratio() {
        if (this._ratio === undefined) {
            this._ratio = this.y.size / this.x.size;
        }

        return this._ratio;
    }

    constructor(public readonly x: LinearSpace, public readonly y: LinearSpace) {}
};

const frameNumberSpace: LinearSpace = new LinearSpace(-1, 1);

const frameNumberSpace2d: LinearSpace2d = new LinearSpace2d(frameNumberSpace, frameNumberSpace);

export const numberSpace = {
    frame: frameNumberSpace,
    frame2d: frameNumberSpace2d,
    geometryWorldTexels: (vertices: Geoposition[]): LinearSpace2d => {
        const worldSpaceTexelsXs = vertices.map(vertex => vertex.worldTexel.x);
        const worldSpaceTexelsYs = vertices.map(vertex => vertex.worldTexel.y);
        const minX = Math.min(...worldSpaceTexelsXs);
        const maxX = Math.max(...worldSpaceTexelsXs);
        const minY = Math.min(...worldSpaceTexelsYs);
        const maxY = Math.max(...worldSpaceTexelsYs);
        
        return new LinearSpace2d(
            new LinearSpace(minX, maxX),
            new LinearSpace(minY, maxY),
        );
    },
    rectangleWorldTexels: (lowerLeft: Geoposition, upperRight: Geoposition): LinearSpace2d => {
        const lowerTexel = lowerLeft.worldTexel;
        const upperTexel = upperRight.worldTexel;
        
        return new LinearSpace2d(
            new LinearSpace(lowerTexel.x, upperTexel.x),
            new LinearSpace(lowerTexel.y, upperTexel.y),
        );
    },
};

export const transform = {
    vertices: (vertices: Geoposition[], from: LinearSpace2d, to: LinearSpace2d) => vertices
        .map(vertex => ({
            x: from.x.convert(vertex.worldTexel.x, to.x),
            y: from.y.convert(vertex.worldTexel.y, to.y),
        })),
    vertex: (vertex: Vector2, from: LinearSpace2d, to: LinearSpace2d) => new Vector2(
        from.x.convert(vertex.x, to.x),
        from.y.convert(vertex.y, to.y),
    )
};
