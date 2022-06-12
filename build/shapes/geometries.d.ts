import { ShapeBufferGeometry } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d } from '../utils/LinearFunction';
import { LinearSpace2d } from '../utils/LinearTransform';
export interface Geometry {
    worldToFrameTransform: LinearTransform2d;
    shapeGeometry: ShapeBufferGeometry;
}
export declare class PolygonGeometry implements Geometry {
    private vertices;
    private readonly geometryTexelWorldSpace;
    readonly worldToFrameTransform: LinearTransform2d;
    private _shapeGeometry;
    get shapeGeometry(): ShapeBufferGeometry;
    constructor(vertices: Geoposition[], geometryTexelWorldSpace: LinearSpace2d, worldToFrameTransform: LinearTransform2d);
}
