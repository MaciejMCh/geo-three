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
            const l = Line.withPoints(new Vector2(0, 1), new Vector2(10, -231));
            console.log('xdd', l.test(new Vector2(10, -231)));

            const l1 = Line.withPoints(new Vector2(0, 1), new Vector2(1, 1));
            const l2 = Line.withPoints(new Vector2(0, 10), new Vector2(1, 9));
            console.log('int', l1.intersection(l2));
            


            const frameSpaceVertices = transform.vertices(this.vertices, this.geometryTexelWorldSpace, numberSpace.frame2d);
            //const coordinatesList = frameSpaceVertices.map(vertex => new Vector2(vertex.x, vertex.y));

            const coordinatesList = this.vertices.map(vertex => vertex.worldTexel);
            console.log(coordinatesList);

            const width = 100;
            // const ratio = Math.abs(this.geometryTexelWorldSpace.ratio);
            // console.log('ratio', ratio);

            var previous: {
                lhsWing: Line;
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
                    const xd1 = currentLhsWing.clone();
                    const xd2 = otherLhsWingPoint.clone();
                    const lhsWingLine = Line.withPoints(xd1, xd2);
                    console.log('test line', lhsWingLine.test(xd1), lhsWingLine.test(xd2));
                    console.log('xxxxxxxxx', currentLhsWing, otherLhsWingPoint, lhsWingLine);

                    previous = {
                        lhsWing: lhsWingLine,
                    };
                    return;
                }

                console.log('compute index', index);

                const angle = Math.atan2(
                    (nextCore.y - currentCore.y),
                    nextCore.x - currentCore.x,
                );
                const currentLhsWing = v.add(currentCore, v.polarToLinear(angle + (Math.PI * 0.5), width));
                const currentWingLine = Line.withPoints(currentLhsWing, v.add(currentLhsWing, normalizedCore));
                console.log('intersection', previous.lhsWing, currentWingLine);
                const intersection = previous.lhsWing.intersection(currentWingLine);

                [intersection].forEach(vertex => {
                    const frameSpaceVertex = transform.vertex(vertex, this.geometryTexelWorldSpace, numberSpace.frame2d);
                    verts.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
                });

                // verts.push(-1, 1, 0);
                inds.push(
                    4, 1, 2,
                );
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