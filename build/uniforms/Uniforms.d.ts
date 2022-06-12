import { IUniform, Shader, Texture } from 'three';
import { Geoposition } from '../nodes/primitive';
import { LinearTransform2d } from '../utils/LinearFunction';
declare type Uniforms = {
    [uniform: string]: IUniform<any>;
};
export declare class DrawableIdentity {
    readonly raw: string;
}
export declare class ShaderUniforms {
    uniforms: Uniforms;
    private circlesByIds;
    private circlesCount;
    create: {
        circle: () => DrawableIdentity;
    };
    update: {
        circle: {
            geoposition: (identity: DrawableIdentity, geoposition: Geoposition) => void;
            radius: (identity: DrawableIdentity, radius: number) => void;
        };
        shapes: {
            worldToFrameTransform: (worldToFrameTransform: LinearTransform2d) => void;
            bufferTexture: (shapesBufferTexture: Texture) => void;
        };
    };
    remove: {
        circle: (identity: DrawableIdentity) => void;
    };
    addShader: (shader: Shader) => void;
    private setup;
    private makeBlankCircle;
    private setupCircles;
    private setupShapes;
}
export {};
