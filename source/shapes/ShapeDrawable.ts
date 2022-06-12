import { DrawableIdentity, ShaderUniforms } from '../uniforms';
import { Geometry } from './geometries';
import { Shape } from './Shapes';

export class ShapeDrawable {
    constructor(
        private readonly shape: Shape,
        private readonly drawableIdentity: DrawableIdentity,
        private readonly shaderUniforms: ShaderUniforms,
    ) {}

    updateGeometry = (geometry: Geometry) => {
        this.shaderUniforms.update.shape.worldToFrameTransform(this.drawableIdentity, geometry.worldToFrameTransform);
        this.shape.updateGeometry(geometry.shapeGeometry);
    };
}
