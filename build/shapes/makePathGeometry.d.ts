import { BufferGeometry } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearSpace2d } from '../utils/LinearTransform';
export declare const makePathGeometry: (geopositions: Geoposition[], geometryTexelWorldSpace: LinearSpace2d) => BufferGeometry;
