import { WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';
export declare class RenderEnviroment {
    readonly webGlRenderer: WebGLRenderer;
    readonly deferredRenderer: DeferredRenderer;
    readonly shaderUniforms: ShaderUniforms;
    constructor(webGlRenderer: WebGLRenderer, deferredRenderer: DeferredRenderer, shaderUniforms: ShaderUniforms);
    makeShape: () => void;
}
