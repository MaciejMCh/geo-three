import { WebGLRenderer } from 'three';
import { Shapes } from '../shapes/Shapes';
export declare class DeferredRenderer {
    readonly shapes: Shapes;
    render: (webglRenderer: WebGLRenderer) => void;
}
