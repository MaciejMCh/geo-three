import { LinearSpace2, LinearTransform2d, ProjectedSpatialReference } from 'geometry';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { ShaderUniforms } from './uniforms';
import { ModelUpdateLoop } from './uniforms/ModelUpdateLoop';

export class RenderEnviroment {
    public readonly modelUpdateLoop = new ModelUpdateLoop({ worldCamera: this.worldCamera });

    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
        public readonly worldScene: Scene,
        public readonly worldCamera: PerspectiveCamera,
    ) {
        webGlRenderer.setClearColor(0x000000, 0);
    }

    setupShapes = (texelWorldSpace: LinearSpace2<ProjectedSpatialReference>, texelWorldTransform: LinearTransform2d) => {
        this.shaderUniforms.update.shapes.worldToFrameTransform(texelWorldTransform);
        this.shaderUniforms.update.shapes.bufferTexture(this.deferredRenderer.shapes.bufferTexture);
    };

    waitForUniforms = async () => {
        await this.shaderUniforms.waitForSetup();
    };
}
