import { Mesh } from 'three';
import { LineSegmentsGeometry } from './LineSegmentsGeometry';
import { LineMaterial } from './LineMaterial';
export declare class LineSegments2 extends Mesh {
    isLineSegments2: any;
    constructor(geometry?: LineSegmentsGeometry, material?: LineMaterial);
    computeLineDistances(): this;
    raycast(raycaster: any, intersects: any): void;
}
