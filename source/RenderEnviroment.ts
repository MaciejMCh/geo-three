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
    ) {}

    setupShapes = (texelWorldSpace: LinearSpace2d, texelWorldTransform: LinearTransform2d, vertices: Geoposition[]) => {
        this.shaderUniforms.update.shapes.worldToFrameTransform(texelWorldTransform);
        const shape = this.deferredRenderer.shapes.makeShape();
        this.shaderUniforms.update.shapes.bufferTexture(shape.bufferSampler);
        shape.updateGeometry(new PolygonGeometry(vertices, texelWorldSpace, texelWorldTransform).shapeGeometry);
    };
}
