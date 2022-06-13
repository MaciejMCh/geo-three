import { BufferAttribute, BufferGeometry, Shape, ShapeBufferGeometry, Vector2 } from 'three';
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

export class PathGeometry implements Geometry {
    private _shapeGeometry!: ShapeBufferGeometry;

    get shapeGeometry() {
        if (!this._shapeGeometry) {
            const frameSpaceVertices = transform.vertices(this.vertices, this.geometryTexelWorldSpace, numberSpace.frame2d);
            const coordinatesList = frameSpaceVertices.map(vertex => new Vector2(vertex.x, vertex.y));

            // const geometry = new BufferGeometry();
            // geometry.setAttribute('position', new BufferAttribute(new Float32Array([
            //     coordinatesList[0].x, coordinatesList[0].y, 0,
            //     coordinatesList[1].x, coordinatesList[1].y, 0,
            //     coordinatesList[2].x, coordinatesList[2].y, 0,
            // ]), 3));
            // geometry.setIndex(new BufferAttribute(new Uint32Array([0, 1, 2]), 1));

            const width = 0.1;
            const ratio = Math.abs(this.geometryTexelWorldSpace.ratio);
            console.log('ratio', ratio);

            const angle = Math.atan2(
                (coordinatesList[1].y - coordinatesList[0].y) * ratio,
                coordinatesList[1].x - coordinatesList[0].x,
            );

            console.log('angle', angle);
            
            const shifted1 = angle + (Math.PI * 0.5);
            const xShift1 = Math.cos(shifted1) * width;
            const yShift1 = Math.sin(shifted1) * width;

            const shifted2 = angle - (Math.PI * 0.5);
            const xShift2 = Math.cos(shifted2) * width;
            const yShift2 = Math.sin(shifted2) * width;
            

            const vertices = new Float32Array( [
                coordinatesList[0].x, coordinatesList[0].y, 0,
                coordinatesList[1].x, coordinatesList[1].y, 0,
                coordinatesList[0].x + xShift1, coordinatesList[0].y + yShift1, 0,
                coordinatesList[0].x + xShift2, coordinatesList[0].y + yShift2, 0,
            ] );
            var indices = new Uint16Array( [
                0, 1, 2,
                0, 3, 1,
            ] );
            const geometry = new BufferGeometry();
            geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
            geometry.setIndex( new BufferAttribute( indices, 1 ) );
            this._shapeGeometry = geometry;
        }
        return this._shapeGeometry;
    }

    constructor(
        private vertices: Geoposition[],
        private readonly geometryTexelWorldSpace: LinearSpace2d,
        public readonly worldToFrameTransform: LinearTransform2d,
    ) {}
}