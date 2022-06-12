import { WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';

export class RenderEnviroment {
    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
    ) {}
}
