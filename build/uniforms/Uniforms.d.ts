import { Shader } from 'three';
import { Geoposition } from '../nodes/primitive';
export declare class DrawableIdentity {
    readonly raw: string;
}
export declare class ShaderUniforms {
    private circlesCount;
    private uniforms;
    private circlesByIds;
    create: {
        circle: () => DrawableIdentity;
    };
    update: {
        circle: {
            geoposition: (identity: DrawableIdentity, geoposition: Geoposition) => void;
            radius: (identity: DrawableIdentity, radius: number) => void;
        };
    };
    remove: {
        circle: (identity: DrawableIdentity) => void;
    };
    addShader: (shader: Shader) => void;
    createCircle: () => void;
    private setup;
    private makeBlankCircle;
    private setupCircles;
}
