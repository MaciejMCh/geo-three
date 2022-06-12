import { WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';
import { LinearTransform2d } from './utils/LinearFunction';

export class RenderEnviroment {
    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
    ) {}

    setupShapes = (texelWorldTransform: LinearTransform2d) => {
        this.shaderUniforms.update.shapes.worldToFrameTransform(texelWorldTransform);
    };
}
