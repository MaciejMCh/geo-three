import { Camera, Mesh, Scene, ShapeBufferGeometry, WebGLRenderer, WebGLRenderTarget } from 'three';
export declare class Shape {
    private readonly bufferTexture;
    private readonly bufferScene;
    private readonly camera;
    private readonly mesh;
    get bufferSampler(): import("three").Texture;
    constructor(bufferTexture: WebGLRenderTarget, bufferScene: Scene, camera: Camera, mesh: Mesh);
    static make: () => Shape;
    updateGeometry: (geometry: ShapeBufferGeometry) => void;
    render: (webglRenderer: WebGLRenderer) => void;
}
export declare class Shapes {
    private readonly shapes;
    makeShape: () => Shape;
    render: (webglRenderer: WebGLRenderer) => void;
}
