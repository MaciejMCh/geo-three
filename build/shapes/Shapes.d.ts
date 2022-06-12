import { Camera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three';
declare class Shape {
    private readonly bufferTexture;
    private readonly bufferScene;
    private readonly camera;
    get bufferSampler(): import("three").Texture;
    constructor(bufferTexture: WebGLRenderTarget, bufferScene: Scene, camera: Camera);
    static make: () => Shape;
    render: (webglRenderer: WebGLRenderer) => void;
}
export declare class Shapes {
    private readonly shapes;
    makeShape: () => Shape;
    render: (webglRenderer: WebGLRenderer) => void;
}
export {};
