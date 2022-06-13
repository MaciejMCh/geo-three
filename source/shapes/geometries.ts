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

            const width = 0.1;
            const ratio = Math.abs(this.geometryTexelWorldSpace.ratio);
            console.log('ratio', ratio);

            var previousVetex: Vector2 | undefined;

            const verts: number[] = [];
            const inds: number[] = [];

            coordinatesList.forEach((vertex, index) => {
                const nextVertex = coordinatesList[index + 1];
                if (!previousVetex) {
                    const angle = Math.atan2(
                        (nextVertex.y - vertex.y) * ratio,
                        nextVertex.x - vertex.x,
                    );

                    const shifted1 = angle + (Math.PI * 0.5);
                    const xShift1 = Math.cos(shifted1) * width;
                    const yShift1 = Math.sin(shifted1) * width;

                    const shifted2 = angle - (Math.PI * 0.5);
                    const xShift2 = Math.cos(shifted2) * width;
                    const yShift2 = Math.sin(shifted2) * width;

                    verts.push(
                        vertex.x, vertex.y, 0, // current core
                        nextVertex.x, nextVertex.y, 0, // next core
                        vertex.x + xShift1, vertex.y + yShift1, 0, // current lhs wing
                        vertex.x + xShift2, vertex.y + yShift2, 0, // current rhs wing
                    );

                    inds.push(
                        0, 1, 2, // lhs wing
                        0, 3, 1, // rhs wing
                    );

                    previousVetex = vertex;
                }
            });
            
            const geometry = new BufferGeometry();
            geometry.setAttribute( 'position', new BufferAttribute( new Float32Array(verts), 3 ) );
            geometry.setIndex( new BufferAttribute( new Uint16Array(inds), 1 ) );
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