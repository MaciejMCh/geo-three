import { Shader } from 'three';
export declare type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};
export interface Uniforms {
    create: {
        circle: () => void;
    };
    update: {
        circle: {
            geoposition: (index: number, geoposition: Geoposition) => void;
            radius: (index: number, radius: number) => void;
        };
    };
}
export declare class ShaderUniforms implements Uniforms {
    shader: Shader;
    private circlesCount;
    create: {
        circle: () => void;
    };
    update: {
        circle: {
            geoposition: (index: number, geoposition: Geoposition) => void;
            radius: (index: number, radius: number) => void;
        };
    };
    constructor(shader: Shader);
}
export declare class CompoundShaders implements Uniforms {
    private uniforms;
    private children;
    private circlesCount;
    addUniforms: (uniforms: Uniforms) => void;
    create: {
        circle: () => void;
    };
    update: {
        circle: {
            geoposition: (index: number, geoposition: Geoposition) => void;
            radius: (index: number, radius: number) => void;
        };
    };
}
export declare const rootUniforms: CompoundShaders;
