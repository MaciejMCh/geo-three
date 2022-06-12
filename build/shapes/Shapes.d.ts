import { Camera, Mesh, Scene, ShapeBufferGeometry, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
export declare class Shape {
    private readonly bufferTexture;
    private readonly bufferScene;
    private readonly camera;
    private readonly mesh;
    get bufferSampler(): Texture;
    constructor(bufferTexture: WebGLRenderTarget, bufferScene: Scene, camera: Camera, mesh: Mesh);
    updateGeometry: (geometry: ShapeBufferGeometry) => void;
    render: (webglRenderer: WebGLRenderer) => void;
}
export declare class Shapes {
    private readonly shapes;
    private readonly setup;
    get bufferTexture(): Texture;
    constructor();
    render: (webglRenderer: WebGLRenderer) => void;
}
