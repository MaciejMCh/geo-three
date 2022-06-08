import { Shader } from 'three';
export declare type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};
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
            geoposition: (id: DrawableIdentity, geoposition: number) => void;
            radius: (identity: DrawableIdentity, radius: number) => void;
        };
    };
    addShader: (shader: Shader) => void;
    createCircle: () => void;
    private setup;
    private setupCircles;
}
export declare const rootUniforms: ShaderUniforms;
