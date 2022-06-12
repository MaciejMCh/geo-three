import { WebGLRenderer } from 'three';
import { Shapes } from '../shapes/Shapes';

export class DeferredRenderer {
    public readonly shapes = new Shapes();

    render = (webglRenderer: WebGLRenderer) => {
        this.shapes.render(webglRenderer);
    };
}
