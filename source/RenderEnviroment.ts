import { PerspectiveCamera, WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';
import { ModelUpdateLoop } from './uniforms/ModelUpdateLoop';
import { LinearTransform2d } from './utils/LinearFunction';
import { LinearSpace2d } from './utils/LinearTransform';

export class RenderEnviroment {
    public readonly modelUpdateLoop = new ModelUpdateLoop({ worldCamera: this.worldCamera });

    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
        public readonly worldCamera: PerspectiveCamera,
    ) {
        webGlRenderer.setClearColor(0x000000, 0);
    }

    setupShapes = (texelWorldSpace: LinearSpace2d, texelWorldTransform: LinearTransform2d) => {
        this.shaderUniforms.update.shapes.worldToFrameTransform(texelWorldTransform);
        this.shaderUniforms.update.shapes.bufferTexture(this.deferredRenderer.shapes.bufferTexture);
    };
}
