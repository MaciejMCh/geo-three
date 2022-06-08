import { Shader, Uniform, Vector3 } from 'three';
import { constants } from './constants';

export type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};

export interface Uniforms {
    create: {
        circle: () => void;
    }

    update: {
        circle: {
            geoposition: (index: number, geoposition: Geoposition) => void;
            radius: (index: number, radius: number) => void;
        };
    };
}

export class ShaderUniforms implements Uniforms {
    private circlesCount = 0;
    
    create: { circle: () => void; };
    
    update: { circle: { geoposition: (index: number, geoposition: Geoposition) => void; radius: (index: number, radius: number) => void; }; };

    constructor(public shader: Shader) {
        console.log('create single shader');
        const circles: object[] = [];
        for (let index = 0; index < constants.circles.limit; index++) {
            circles.push({
                worldOrigin: new Vector3(),
			    radius: 0,
            });
        }
		shader.uniforms['circles'] = new Uniform(circles);
        shader.uniforms['circlesCount'] = new Uniform(0);
        
        this.create = {
            circle: () => {
                console.log('create single circle');
                this.shader.uniforms['circles'].value[this.circlesCount]['radius'] = 500;
                this.shader.uniforms['circles'].value[this.circlesCount]['worldOrigin'] = new Vector3(6484614.558396748, 0, -2705261.510353672);
                this.circlesCount += 1;
                shader.uniforms['circlesCount'].value = this.circlesCount;
            },
        };

        this.update = {
            circle: {
                geoposition: (index, geoposition) => {
                    // this.shader.uniforms['circles'].value[index] = new Vector3()
                },
                radius: (index, radius) => {
                    this.shader.uniforms['circles'].value[index]['radius'] = radius;
                    // this.shader.uniforms['circles'].value = this.shader.uniforms['circles'].value;
                },
            },
        };
    }
}

export class CompoundShaders implements Uniforms {
    private children: Uniforms[] = [];

    addUniforms = (uniforms: Uniforms) => {
        if (this.children.length > 0) {
            const first = (this.children[0] as ShaderUniforms);
            (uniforms as ShaderUniforms).shader.uniforms = first.shader.uniforms;
        }
        this.children.push(uniforms);
    };

    create = {
        circle: () => {
            this.children.forEach(uniforms => {
                uniforms.create.circle();
            });
        },
    };

    update = {
        circle: {
            geoposition: (index: number, geoposition: Geoposition) => {
                this.children.forEach(uniforms => {
                    uniforms.update.circle.geoposition(index, geoposition);
                });
            },
            radius: (index: number, radius: number) => {
                this.children.forEach(uniforms => {
                    uniforms.update.circle.radius(index, radius);
                });
            },
        },
    };
}

export const rootUniforms = new CompoundShaders();
