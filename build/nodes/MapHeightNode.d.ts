import { Material, BufferGeometry, Vector3, Raycaster, Intersection, WebGLRenderer } from 'three';
import { MapNode } from './MapNode';
import { MapView } from '../MapView';
import { ShaderUniforms } from '../uniforms';
export declare class MapHeightNode extends MapNode {
    private uniforms;
    private renderer;
    heightLoaded: boolean;
    textureLoaded: boolean;
    static tileSize: number;
    geometrySize: number;
    geometryNormals: boolean;
    static geometry: BufferGeometry;
    static baseGeometry: BufferGeometry;
    static baseScale: Vector3;
    constructor(uniforms: ShaderUniforms, renderer: WebGLRenderer, parentNode?: MapHeightNode, mapView?: MapView, location?: number, level?: number, x?: number, y?: number, geometry?: BufferGeometry, material?: Material);
    initialize(): void;
    identity(): string;
    loadTexture(): Promise<void>;
    nodeReady(): void;
    createChildNodes(): void;
    loadHeightGeometry(): Promise<any>;
    raycast(raycaster: Raycaster, intersects: Intersection[]): void;
}
