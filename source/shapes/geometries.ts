import { Shape, ShapeBufferGeometry, Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d, wordSpaceTexelFunction } from '../utils/LinearFunction';
import { LinearSpace2d, numberSpace, transform } from '../utils/LinearTransform';

export interface Geometry {
    worldToFrameTransform: LinearTransform2d;

    shapeGeometry: ShapeBufferGeometry;
}

export class PolygonGeometry implements Geometry {
    private _shapeGeometry!: ShapeBufferGeometry;

    get shapeGeometry() {
        if (!this._shapeGeometry) {
            const frameSpaceVertices = transform.vertices(this.vertices, this.geometryTexelWorldSpace, numberSpace.frame2d);
            const coordinatesList = frameSpaceVertices.map(vertex => new Vector2(vertex.x, vertex.y));

            console.log('coords', coordinatesList);
            this._shapeGeometry = new ShapeBufferGeometry(new Shape(coordinatesList));
        }
        return this._shapeGeometry;
    }

    constructor(
        private vertices: Geoposition[],
        private readonly geometryTexelWorldSpace: LinearSpace2d,
        public readonly worldToFrameTransform: LinearTransform2d,
    ) {}
}
