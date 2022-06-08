import { Vector3 } from 'three';
export declare class Geoposition {
    readonly longitude: number;
    readonly latitude: number;
    readonly altitude?: number;
    private _worldPosition;
    get worldPosition(): Vector3;
    constructor(args: {
        longitude: number;
        latitude: number;
        altitude?: number;
    });
}
