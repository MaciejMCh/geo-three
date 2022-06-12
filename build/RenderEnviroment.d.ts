import { WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShapeDrawable } from './shapes/ShapeDrawable';
import { ShaderUniforms } from './uniforms';
export declare class RenderEnviroment {
    readonly webGlRenderer: WebGLRenderer;
    readonly deferredRenderer: DeferredRenderer;
    readonly shaderUniforms: ShaderUniforms;
    constructor(webGlRenderer: WebGLRenderer, deferredRenderer: DeferredRenderer, shaderUniforms: ShaderUniforms);
    makeShape: () => ShapeDrawable;
}
