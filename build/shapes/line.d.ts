import * as THREE from 'three';
export declare class MeshLine extends THREE.BufferGeometry {
    isMeshLine: any;
    positions: any;
    previous: any;
    next: any;
    side: any;
    width: any;
    indices_array: any;
    uvs: any;
    counters: any;
    _points: any;
    _geom: any;
    widthCallback: any;
    matrixWorld: any;
    setMatrixWorld: any;
    setGeometry: any;
    setPoints: any;
    raycast: any;
    compareV3: any;
    copyV3: any;
    process: any;
    advance: any;
    isMeshLineMaterial: any;
    constructor();
}
export declare class MeshLineMaterial extends THREE.ShaderMaterial {
    isMeshLineMaterial: any;
    constructor(parameters: any);
}
