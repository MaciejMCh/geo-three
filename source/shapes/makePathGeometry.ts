import { BufferAttribute, BufferGeometry, Vector2 } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearSpace2d, numberSpace, transform } from '../utils/LinearTransform';

type PathSide = 'left' | 'core' | 'right';

const WIDTH = 200;

class Line {
    constructor(
        public readonly a: number,
        public readonly b: number,
        public readonly c: number,
    ) {}

    static withPoints = (lhs: Vector2, rhs: Vector2): Line => {
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
};

const makeWings = (leadingCore: Vector2, trailingCore: Vector2, width: number, reverse: boolean = false) => {
    const factor = reverse ? -1 : 1;
    const angle = Math.atan2(
        (leadingCore.y - trailingCore.y) * factor,
        (leadingCore.x - trailingCore.x) * factor,
    );
    const lhs = v.add(leadingCore, v.polarToLinear(angle + (Math.PI * 0.5), width));
    const rhs = v.add(leadingCore, v.polarToLinear(angle - (Math.PI * 0.5), width));
    return { lhs, rhs };
}

const sideFactor = (pathSide: PathSide) => ({
    'left': 0,
    'core': 0.5,
    'right': 1.0,
})[pathSide]

export const makePathGeometry = (geopositions: Geoposition[], geometryTexelWorldSpace: LinearSpace2d) => {
    const coordinatesList = geopositions.map(vertex => vertex.worldTexel);
    const width = WIDTH;

    let previous: {
        lhsWing: Line;
        rhsWing: Line;
        indices: {
            core: number;
            lhsWing: number;
            rhsWing: number;
        },
    } | undefined;

    var verticesCount = 0;
    const vertices: number[] = [];
    const indices: number[] = [];
    const stats: number[] = [];

    const appendVertex = (vertex: Vector2, pathSide: PathSide) => {
        const frameSpaceVertex = transform.vertex(vertex, geometryTexelWorldSpace, numberSpace.frame2d);
        vertices.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
        stats.push(sideFactor(pathSide), sideFactor(pathSide));
        verticesCount += 1;
        return (vertices.length / 3) - 1;
    };

    const finishShape = (previousCore: Vector2, currentCore: Vector2) => {
        const currentWings = makeWings(currentCore, previousCore, width);
        const lhsWingIndex = appendVertex(currentWings.lhs, 'left');
        const rhsWingIndex = appendVertex(currentWings.rhs, 'right');

        indices.push(
            lhsWingIndex, previous.indices.core, previous.indices.lhsWing,
            rhsWingIndex, previous.indices.rhsWing, previous.indices.core
        );
    };

    const startShape = (currentCore: Vector2, nextCore: Vector2, normalizedCore: Vector2) => {
        const wings = makeWings(currentCore, nextCore, width, true);
        const currentCoreIndex = appendVertex(currentCore, 'core');
        const nextCoreIndex = appendVertex(nextCore, 'core');
        const lhsWingIndex = appendVertex(wings.lhs, 'left');
        const rhsWingIndex = appendVertex(wings.rhs, 'right');

        indices.push(
            currentCoreIndex, lhsWingIndex, nextCoreIndex,
            currentCoreIndex, nextCoreIndex, rhsWingIndex,
        );

        const otherLhsWingPoint = v.add(wings.lhs, normalizedCore);
        const lhsWingLine = Line.withPoints(wings.lhs, otherLhsWingPoint);

        const otherRhsWingPoint = v.add(wings.rhs, normalizedCore);
        const rhsWingLine = Line.withPoints(wings.rhs, otherRhsWingPoint);

        previous = {
            lhsWing: lhsWingLine,
            rhsWing: rhsWingLine,
            indices: {
                core: nextCoreIndex,
                lhsWing: lhsWingIndex,
                rhsWing: rhsWingIndex,
            },
        };
    };

    coordinatesList.forEach((currentCore, index) => {
        if (index === coordinatesList.length - 1) {
            finishShape(coordinatesList[index - 1], currentCore);
            return;
        }

        const nextCore = coordinatesList[index + 1];
        const normalizedCore = v.diff(nextCore, currentCore);
        if (index === 0) {
            startShape(currentCore, nextCore, normalizedCore);
            return;
        }

        const currentWing = makeWings(currentCore, nextCore, width, true);
        const currentLhsWingLine = Line.withPoints(currentWing.lhs, v.add(currentWing.lhs, normalizedCore));
        const lhsLinesIntersection = previous.lhsWing.intersection(currentLhsWingLine);
        const currentRhsWingLine = Line.withPoints(currentWing.rhs, v.add(currentWing.rhs, normalizedCore));
        const rhsLinesIntersection = previous.rhsWing.intersection(currentRhsWingLine);

        const lhsWingIndex = appendVertex(lhsLinesIntersection, 'left');
        const rhsWingIndex = appendVertex(rhsLinesIntersection, 'right');

        indices.push(
            lhsWingIndex, previous.indices.core, previous.indices.lhsWing,
            rhsWingIndex, previous.indices.rhsWing, previous.indices.core,
        );

        const nextCoreIndex = appendVertex(nextCore, 'core');
        indices.push(
            nextCoreIndex, previous.indices.core, lhsWingIndex,
            nextCoreIndex, rhsWingIndex, previous.indices.core,
        );

        const otherLhsWingPoint = v.add(currentWing.lhs, normalizedCore);
        const lhsWingLine = Line.withPoints(currentWing.lhs, otherLhsWingPoint);

        const otherRhsWingPoint = v.add(currentWing.rhs, normalizedCore);
        const rhsWingLine = Line.withPoints(currentWing.rhs, otherRhsWingPoint);

        previous = {
            lhsWing: lhsWingLine,
            rhsWing: rhsWingLine,
            indices: {
                core: nextCoreIndex,
                lhsWing: lhsWingIndex,
                rhsWing: rhsWingIndex,
            },
        };
    });
    
    const geometry = new BufferGeometry();
    geometry.setAttribute( 'position', new BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute( 'stats', new BufferAttribute(new Float32Array(stats), 2));
    geometry.setIndex( new BufferAttribute( new Uint16Array(indices), 1 ) );
    return geometry;
};
