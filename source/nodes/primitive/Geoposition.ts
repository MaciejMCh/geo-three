import { Vector2, Vector3 } from 'three';
import { UnitsUtils } from '../../utils/UnitsUtils';

export class Geoposition {
    readonly longitude: number;
    readonly latitude: number;
    readonly altitude?: number;

    private _worldPosition: Vector3;

    private _worldTexel: Vector2;

    get worldPosition() {
        if (!this._worldPosition) {
            const coords = UnitsUtils.datumsToSpherical(this.latitude, this.longitude);
            this._worldPosition = new Vector3(coords.x, 0, -coords.y);
        }

        return this._worldPosition;
    }

    get worldTexel() {
        if (!this._worldTexel) {
            this._worldTexel = new Vector2(this._worldPosition.x, this.worldPosition.z);
        }

        return this._worldTexel;
    }

    constructor(args: {
        longitude: number;
        latitude: number;
        altitude?: number;
    }) {
        this.longitude = args.longitude;
        this.latitude = args.latitude;
        this.altitude = args.altitude;
    }
};
