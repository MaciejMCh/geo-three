import { Shader } from 'three';
export declare type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};
export declare class ShaderUniforms {
    private circlesCount;
    private uniforms;
    create: {
        circle: () => void;
    };
    update: {
        circle: {
            geoposition: (index: number, geoposition: number) => void;
            radius: (index: number, radius: number) => void;
        };
    };
    addShader: (shader: Shader) => void;
    createCircle: () => void;
    private setup;
    private setupCircles;
}
export declare const rootUniforms: ShaderUniforms;
