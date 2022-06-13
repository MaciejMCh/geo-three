import { LineSegmentsGeometry } from './LineSegmentsGeometry';
export declare class LineGeometry extends LineSegmentsGeometry {
    isLineGeometry: any;
    constructor();
    setPositions(array: any): this;
    setColors(array: any): this;
    fromLine(line: any): this;
}
