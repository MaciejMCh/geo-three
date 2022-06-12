import { Camera, Scene, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
declare type ShapeRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapeScene: Scene;
    camera: Camera;
};
export declare class Shape {
    private debugIdentity;
    private setup;
    constructor(debugIdentity: string, setup: ShapeRenderSetup);
    render: (webglRenderer: WebGLRenderer) => void;
}
export declare class Shapes {
    private readonly shapes;
    private readonly setup;
    get bufferTexture(): Texture;
    constructor();
    makeShape: (debugIdentity: string) => Shape;
    render: (webglRenderer: WebGLRenderer) => void;
}
export {};
