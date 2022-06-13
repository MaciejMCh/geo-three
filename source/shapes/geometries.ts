import { BufferAttribute, BufferGeometry, Shape, ShapeBufferGeometry, Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d, wordSpaceTexelFunction } from '../utils/LinearFunction';
import { LinearSpace2d, numberSpace, transform } from '../utils/LinearTransform';

const v = {
    add: (lhs: Vector2, rhs: Vector2) => new Vector2(lhs.x + rhs.x, lhs.y + rhs.y),
    polarToLinear: (angle: number, length: number) => new Vector2(Math.cos(angle) * length, Math.sin(angle) * length),
}

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
            //const coordinatesList = frameSpaceVertices.map(vertex => new Vector2(vertex.x, vertex.y));

            const coordinatesList = this.vertices.map(vertex => vertex.worldTexel);
            console.log(coordinatesList);

            const width = 100;
            // const ratio = Math.abs(this.geometryTexelWorldSpace.ratio);
            // console.log('ratio', ratio);

            var previousVetex: Vector2 | undefined;

            const verts: number[] = [];
            const inds: number[] = [];

            coordinatesList.forEach((vertex, index) => {
                const nextVertex = coordinatesList[index + 1];
                if (!previousVetex) {
                    const angle = Math.atan2(
                        (nextVertex.y - vertex.y),
                        nextVertex.x - vertex.x,
                    );

                    const shifted1 = angle + (Math.PI * 0.5);
                    const xShift1 = Math.cos(shifted1) * width;
                    const yShift1 = Math.sin(shifted1) * width;

                    const shifted2 = angle - (Math.PI * 0.5);
                    const xShift2 = Math.cos(shifted2) * width;
                    const yShift2 = Math.sin(shifted2) * width;

                    const currentLhsWing = v.add(vertex, v.polarToLinear(angle + (Math.PI * 0.5), width));
                    const currentRhsWing = v.add(vertex, v.polarToLinear(angle - (Math.PI * 0.5), width));

                    const frameSpaceVertex = transform.vertex(vertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    const frameSpaceNewVertex = transform.vertex(nextVertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    const frameSpaceCurrentLhsWing = transform.vertex(currentLhsWing, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    const frameSpaceCurrentRhsWing = transform.vertex(currentRhsWing, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    
                    

                    verts.push(
                        frameSpaceVertex.x, frameSpaceVertex.y, 0, // current core
                        frameSpaceNewVertex.x, frameSpaceNewVertex.y, 0, // next core
                        frameSpaceCurrentLhsWing.x, frameSpaceCurrentLhsWing.y, 0, // current lhs wing
                        frameSpaceCurrentRhsWing.x, frameSpaceCurrentRhsWing.y, 0, // current rhs wing
                    );

                    inds.push(
                        0, 2, 1, // lhs wing
                        0, 1, 3, // rhs wing
                    );

                    previousVetex = vertex;
                }
            });

            console.log('vets', verts);
            
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