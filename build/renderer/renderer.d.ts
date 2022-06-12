import { WebGLRenderer } from 'three';
export declare class DeferredRenderer {
    private readonly shapes;
    render: (webglRenderer: WebGLRenderer) => void;
}
