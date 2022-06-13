import { LineSegments2 } from './LineSegments2';
import { LineGeometry } from './LineGeometry';
import { LineMaterial } from './LineMaterial';
declare class Line2 extends LineSegments2 {
    isLine2: any;
    constructor(geometry?: LineGeometry, material?: LineMaterial);
}
export { Line2 };
