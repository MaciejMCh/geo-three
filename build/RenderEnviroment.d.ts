import { PerspectiveCamera, WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';
import { ModelUpdateLoop } from './uniforms/ModelUpdateLoop';
import { LinearTransform2d } from './utils/LinearFunction';
import { LinearSpace2d } from './utils/LinearTransform';
export declare class RenderEnviroment {
    readonly webGlRenderer: WebGLRenderer;
    readonly deferredRenderer: DeferredRenderer;
    readonly shaderUniforms: ShaderUniforms;
    readonly worldCamera: PerspectiveCamera;
    readonly modelUpdateLoop: ModelUpdateLoop;
    constructor(webGlRenderer: WebGLRenderer, deferredRenderer: DeferredRenderer, shaderUniforms: ShaderUniforms, worldCamera: PerspectiveCamera);
    setupShapes: (texelWorldSpace: LinearSpace2d, texelWorldTransform: LinearTransform2d) => void;
}
