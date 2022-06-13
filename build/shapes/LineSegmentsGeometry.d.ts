import { InstancedBufferGeometry } from 'three';
export declare class LineSegmentsGeometry extends InstancedBufferGeometry {
    isLineSegmentsGeometry: any;
    constructor();
    applyMatrix4(matrix: any): this;
    setPositions(array: any): this;
    setColors(array: any): this;
    fromWireframeGeometry(geometry: any): this;
    fromEdgesGeometry(geometry: any): this;
    fromMesh(mesh: any): this;
    fromLineSegments(lineSegments: any): this;
    computeBoundingBox(): void;
    computeBoundingSphere(): void;
    toJSON(): void;
    applyMatrix(matrix: any): this;
}
