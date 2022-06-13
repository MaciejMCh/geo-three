import { BufferAttribute, BufferGeometry, Shape, ShapeBufferGeometry, Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d, wordSpaceTexelFunction } from '../utils/LinearFunction';
import { LinearSpace2d, numberSpace, transform } from '../utils/LinearTransform';

class Line {
    constructor(
        public readonly a: number,
        public readonly b: number,
        public readonly c: number,
    ) {}

    static withPoints = (lhs: Vector2, rhs: Vector2): Line => {
        console.log('line with points', lhs, rhs);
        const a = lhs.y - rhs.y;
        const b = rhs.x - lhs.x;
        const c = (lhs.x * rhs.y) - (rhs.x * lhs.y);
        return new Line(a, b, c);
    }

    intersection = (other: Line): Vector2 => {
        const delta = this.a * other.b - other.a * this.b;
        if (delta == 0) 
            throw new Error('Lines are parallel');

        const x = ((other.b * this.c) - (this.b * other.c)) / delta;
        const y = ((this.a * other.c) - (other.a * this.c)) / delta;

        return new Vector2(-x, -y);
    };

    test = (point: Vector2) => (this.a * point.x) + (this.b * point.y) + this.c;
}

const v = {
    add: (lhs: Vector2, rhs: Vector2) => new Vector2(lhs.x + rhs.x, lhs.y + rhs.y),
    polarToLinear: (angle: number, length: number) => new Vector2(Math.cos(angle) * length, Math.sin(angle) * length),
    diff: (lhs: Vector2, rhs: Vector2) => new Vector2(lhs.x - rhs.x, lhs.y - rhs.y),
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

            var previous: {
                lhsWing: Line;
                rhsWing: Line;
                indices: {
                    core: number;
                    lhsWing: number;
                    rhsWing: number;
                },
            } | undefined;

            const verts: number[] = [];
            const inds: number[] = [];

            coordinatesList.forEach((currentCore, index) => {
                if (index > 1) {
                    return;
                }

                const nextCore = coordinatesList[index + 1];
                const normalizedCore = v.diff(nextCore, currentCore);
                if (!previous) {
                    const angle = Math.atan2(
                        (nextCore.y - currentCore.y),
                        nextCore.x - currentCore.x,
                    );
                    const currentLhsWing = v.add(currentCore, v.polarToLinear(angle + (Math.PI * 0.5), width));
                    const currentRhsWing = v.add(currentCore, v.polarToLinear(angle - (Math.PI * 0.5), width));
                    
                    [currentCore, nextCore, currentLhsWing, currentRhsWing].forEach(vertex => {
                        const frameSpaceVertex = transform.vertex(vertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                        verts.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
                    });

                    inds.push(
                        0, 2, 1, // lhs wing
                        0, 1, 3, // rhs wing
                    );

                    const otherLhsWingPoint = v.add(currentLhsWing, normalizedCore);
                    const lhsWingLine = Line.withPoints(currentLhsWing, otherLhsWingPoint);

                    const otherRhsWingPoint = v.add(currentRhsWing, normalizedCore);
                    const rhsWingLine = Line.withPoints(currentRhsWing, otherRhsWingPoint);

                    previous = {
                        lhsWing: lhsWingLine,
                        rhsWing: rhsWingLine,
                        indices: {
                            core: 1,
                            lhsWing: 2,
                            rhsWing: 3,
                        },
                    };
                    return;
                }

                const angle = Math.atan2(
                    (nextCore.y - currentCore.y),
                    nextCore.x - currentCore.x,
                );
                const currentLhsWing = v.add(currentCore, v.polarToLinear(angle + (Math.PI * 0.5), width));
                const currentLhsWingLine = Line.withPoints(currentLhsWing, v.add(currentLhsWing, normalizedCore));
                const lhsLinesIntersection = previous.lhsWing.intersection(currentLhsWingLine);

                const currentRhsWing = v.add(currentCore, v.polarToLinear(angle - (Math.PI * 0.5), width));
                const currentRhsWingLine = Line.withPoints(currentRhsWing, v.add(currentRhsWing, normalizedCore));
                const rhsLinesIntersection = previous.rhsWing.intersection(currentRhsWingLine);


                [lhsLinesIntersection, rhsLinesIntersection].forEach(vertex => {
                    const frameSpaceVertex = transform.vertex(vertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    verts.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
                });

                const lhsWingIndex = (verts.length / 3) - 2;
                const rhsWingIndex = lhsWingIndex + 1;
                console.log(lhsWingIndex, rhsWingIndex);

                // verts.push(-1, 1, 0);
                inds.push(
                    lhsWingIndex, previous.indices.core, previous.indices.lhsWing,
                    rhsWingIndex, previous.indices.rhsWing, previous.indices.core,
                );

                [nextCore].forEach(vertex => {
                    const frameSpaceVertex = transform.vertex(vertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    verts.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
                });

                const nextCoreIndex = (verts.length / 3) - 1;
                console.log(inds, nextCoreIndex);
                inds.push(
                    nextCoreIndex, previous.indices.core, lhsWingIndex,
                    nextCoreIndex, rhsWingIndex, previous.indices.core,
                );
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