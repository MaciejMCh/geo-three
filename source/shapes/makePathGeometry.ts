import { BufferAttribute, BufferGeometry } from 'three';
import { transform, WorldSurfacePosition, arithmetic, convert, LinearSpace2, Line, numberSpace } from 'geometry';
import { GeographicToProjectedConversion } from 'geometry/lib/spatialConversion';

type PathSide = 'left' | 'core' | 'right';

const WIDTH = 200;

const makeWings = (
    leadingCore: WorldSurfacePosition,
    trailingCore: WorldSurfacePosition,
    width: number,
    reverse: boolean = false,
) => {
    const factor = reverse ? -1 : 1;
    const angle = Math.atan2(
        (leadingCore.y - trailingCore.y) * factor,
        (leadingCore.x - trailingCore.x) * factor,
    );
    const lhs = arithmetic.vec2.add(leadingCore, convert.toLinear({ angle: angle + (Math.PI * 0.5), length: width }));
    const rhs = arithmetic.vec2.add(leadingCore, convert.toLinear({ angle: angle - (Math.PI * 0.5), length: width }));
    return { lhs, rhs };
}

const sideFactor = (pathSide: PathSide) => ({
    'left': -1,
    'core': 0,
    'right': 1,
})[pathSide]

export const makePathGeometry = (geopositions: GeographicToProjectedConversion[], geometryTexelWorldSpace: LinearSpace2<'geographic'>) => {
    const coordinatesList = geopositions.map(vertex => vertex.worldSurfacePosition);
    const width = WIDTH;

    let previous: {
        lhsWing: Line<'projected'>;
        rhsWing: Line<'projected'>;
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

    const appendVertex = (vertex: WorldSurfacePosition, pathSide: PathSide) => {
        const frameSpaceVertex = transform.vertex(vertex, geometryTexelWorldSpace, numberSpace.frame2);
        vertices.push(frameSpaceVertex.x, frameSpaceVertex.y, 0);
        stats.push(sideFactor(pathSide), sideFactor(pathSide));
        verticesCount += 1;
        return (vertices.length / 3) - 1;
    };

    const finishShape = (previousCore: WorldSurfacePosition, currentCore: WorldSurfacePosition) => {
        const currentWings = makeWings(currentCore, previousCore, width);
        const lhsWingIndex = appendVertex(currentWings.lhs, 'left');
        const rhsWingIndex = appendVertex(currentWings.rhs, 'right');

        indices.push(
            lhsWingIndex, previous.indices.core, previous.indices.lhsWing,
            rhsWingIndex, previous.indices.rhsWing, previous.indices.core
        );
    };

    const startShape = (currentCore: WorldSurfacePosition, nextCore: WorldSurfacePosition, normalizedCore: WorldSurfacePosition) => {
        const wings = makeWings(currentCore, nextCore, width, true);
        const currentCoreIndex = appendVertex(currentCore, 'core');
        const nextCoreIndex = appendVertex(nextCore, 'core');
        const lhsWingIndex = appendVertex(wings.lhs, 'left');
        const rhsWingIndex = appendVertex(wings.rhs, 'right');

        indices.push(
            currentCoreIndex, lhsWingIndex, nextCoreIndex,
            currentCoreIndex, nextCoreIndex, rhsWingIndex,
        );

        const otherLhsWingPoint = arithmetic.vec2.add(wings.lhs, normalizedCore);
        const lhsWingLine = Line.withPoints(wings.lhs, otherLhsWingPoint);

        const otherRhsWingPoint = arithmetic.vec2.add(wings.rhs, normalizedCore);
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
        const normalizedCore = arithmetic.vec2.diff(nextCore, currentCore);
        if (index === 0) {
            startShape(currentCore, nextCore, normalizedCore);
            return;
        }

        const currentWing = makeWings(currentCore, nextCore, width, true);
        const currentLhsWingLine = Line.withPoints(currentWing.lhs, arithmetic.vec2.add(currentWing.lhs, normalizedCore));
        const lhsLinesIntersection = previous.lhsWing.intersection(currentLhsWingLine);
        const currentRhsWingLine = Line.withPoints(currentWing.rhs, arithmetic.vec2.add(currentWing.rhs, normalizedCore));
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

        const otherLhsWingPoint = arithmetic.vec2.add(currentWing.lhs, normalizedCore);
        const lhsWingLine = Line.withPoints(currentWing.lhs, otherLhsWingPoint);

        const otherRhsWingPoint = arithmetic.vec2.add(currentWing.rhs, normalizedCore);
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
