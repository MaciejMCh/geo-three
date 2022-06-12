import { Texture, WebGLRenderer } from 'three';
import { Geoposition } from './nodes/primitive';
import { DeferredRenderer } from './renderer/DeferredRenderer';
import { PolygonGeometry } from './shapes/geometries';
import { ShaderUniforms } from './uniforms';
import { LinearTransform2d } from './utils/LinearFunction';
import { LinearSpace2d } from './utils/LinearTransform';

export class RenderEnviroment {
    constructor(
        public readonly webGlRenderer: WebGLRenderer,
        public readonly deferredRenderer: DeferredRenderer,
        public readonly shaderUniforms: ShaderUniforms,
    ) {
        webGlRenderer.setClearColor(0x000000, 0);
    }

    setupShapes = (texelWorldSpace: LinearSpace2d, texelWorldTransform: LinearTransform2d) => {
        this.shaderUniforms.update.shapes.worldToFrameTransform(texelWorldTransform);
        this.shaderUniforms.update.shapes.bufferTexture(this.deferredRenderer.shapes.bufferTexture);
    };
}
