import * as THREE from 'three';
import { BufferGeometry } from 'three';
export declare const updateDeferredGeometry: (updatedGeometry: BufferGeometry) => void;
export declare const xd: (renderer: THREE.WebGLRenderer) => {
    boxMaterial: THREE.MeshBasicMaterial;
};
