import { Camera, Mesh, Scene, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Geometry } from './geometries';
declare type ShapeRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapeScene: Scene;
    camera: Camera;
};
declare class SimpleGeometry {
    private mesh;
    constructor(mesh: Mesh);
    updateGeometry: (geometry: Geometry) => void;
}
export declare class Shape {
    private debugIdentity;
    private setup;
    constructor(debugIdentity: string, setup: ShapeRenderSetup);
    render: (webglRenderer: WebGLRenderer) => void;
    useSimpleGeometry: () => SimpleGeometry;
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
