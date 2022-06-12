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
    private shapesByIds;
    private shapesCount;
    create: {
        circle: () => DrawableIdentity;
        shape: (texture: Texture) => DrawableIdentity;
    };
    update: {
        circle: {
            geoposition: (identity: DrawableIdentity, geoposition: Geoposition) => void;
            radius: (identity: DrawableIdentity, radius: number) => void;
        };
        shape: {
            worldToFrameTransform: (identity: DrawableIdentity, worldToFrameTransform: LinearTransform2d) => void;
        };
    };
    remove: {
        circle: (identity: DrawableIdentity) => void;
    };
    addShader: (shader: Shader) => void;
    createCircle: () => void;
    private setup;
    private makeBlankCircle;
    private makeBlankShape;
    private setupCircles;
    private setupShapes;
}
export {};
