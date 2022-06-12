import { Shape, ShapeBufferGeometry, Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d, wordSpaceTexelFunction } from '../utils/LinearFunction';
import { LinearSpace2d, numberSpace, transform } from '../utils/LinearTransform';

export interface Geometry {
    worldToFrameTransform: LinearTransform2d;

    shapeGeometry: ShapeBufferGeometry;
}

export class PolygonGeometry implements Geometry {
    private _geometryTexelWorldSpace!: LinearSpace2d;
    
    private _worldToFrameTransform!: LinearTransform2d;

    private _shapeGeometry!: ShapeBufferGeometry;

    get geometryTexelWorldSpace() {
        if (!this._geometryTexelWorldSpace) {
            this._geometryTexelWorldSpace = numberSpace.geometryWorldTexels(this.vertices);
        }
        return this._geometryTexelWorldSpace;
    }

    get worldToFrameTransform() {
        if (!this._worldToFrameTransform) {
            const geometryTexelWorldSpace = this.geometryTexelWorldSpace;
            this._worldToFrameTransform = {
                x: wordSpaceTexelFunction(geometryTexelWorldSpace.x),
                y: wordSpaceTexelFunction(geometryTexelWorldSpace.y),
            };
        }
        return this._worldToFrameTransform;
    }

    get shapeGeometry() {
        if (!this._shapeGeometry) {
            const frameSpaceVertices = transform.vertices(this.vertices, this.geometryTexelWorldSpace, numberSpace.frame2d);
            const coordinatesList = frameSpaceVertices.map(vertex => new Vector2(vertex.x, vertex.y));
            this._shapeGeometry = new ShapeBufferGeometry(new Shape(coordinatesList));
        }
        return this._shapeGeometry;
    }

    constructor(private vertices: Geoposition[]) {}
}
