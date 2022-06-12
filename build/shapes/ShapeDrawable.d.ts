import { DrawableIdentity, ShaderUniforms } from '../uniforms';
import { Geometry } from './geometries';
import { Shape } from './Shapes';
export declare class ShapeDrawable {
    private readonly shape;
    private readonly drawableIdentity;
    private readonly shaderUniforms;
    constructor(shape: Shape, drawableIdentity: DrawableIdentity, shaderUniforms: ShaderUniforms);
    updateGeometry: (geometry: Geometry) => void;
}
