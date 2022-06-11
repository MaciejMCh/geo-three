import { Vector2, Vector3 } from 'three';
export declare class Geoposition {
    readonly longitude: number;
    readonly latitude: number;
    readonly altitude?: number;
    private _worldPosition;
    private _worldTexel;
    get worldPosition(): Vector3;
    get worldTexel(): Vector2;
    constructor(args: {
        longitude: number;
        latitude: number;
        altitude?: number;
    });
}
