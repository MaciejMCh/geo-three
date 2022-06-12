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
    private _geometryTexelWorldSpace;
    private _worldToFrameTransform;
    private _shapeGeometry;
    get geometryTexelWorldSpace(): LinearSpace2d;
    get worldToFrameTransform(): LinearTransform2d;
    get shapeGeometry(): ShapeBufferGeometry;
    constructor(vertices: Geoposition[]);
}
