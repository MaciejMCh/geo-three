import { Camera, Mesh, Scene, Texture, WebGLRenderer, WebGLRenderTarget, LineSegments } from 'three';
import { Geometry } from './geometries';
declare type ShapeRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapeScene: Scene;
    camera: Camera;
};
declare class SimpleGeometry {
    private readonly mesh;
    private invalidate;
    constructor(mesh: Mesh, invalidate: () => void);
    updateGeometry: (geometry: Geometry) => void;
}
declare class PathGeometry {
    readonly mesh: LineSegments;
    private invalidate;
    constructor(mesh: LineSegments, invalidate: () => void);
    updateGeometry: (geometry: Geometry) => void;
}
export declare class Shape {
    private debugIdentity;
    private setup;
    private needsRender;
    constructor(debugIdentity: string, setup: ShapeRenderSetup);
    render: (webglRenderer: WebGLRenderer) => void;
    useSimpleGeometry: () => SimpleGeometry;
    usePathGeometry: () => PathGeometry;
    invalidate: () => void;
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
