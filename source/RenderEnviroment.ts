import { WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShapeDrawable } from './shapes/ShapeDrawable';
import { ShaderUniforms } from './uniforms';

export class RenderEnviroment {
    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
    ) {}

    makeShape = () => {
        const shape = this.deferredRenderer.shapes.makeShape();
        const shapeUniformIdentity = this.shaderUniforms.create.shape(shape.bufferSampler);
        return new ShapeDrawable(shape, shapeUniformIdentity, this.shaderUniforms);
    };
}
