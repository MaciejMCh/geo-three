import { IUniform, Shader, Uniform, Vector3 } from 'three';
import { constants } from './constants';

export type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};

type Uniforms =  { [uniform: string]: IUniform<any> };

export class ShaderUniforms {
    private circlesCount = 0;

    private uniforms!: Uniforms;

    create = {
        circle: () => {
            console.log('create single circle');
            this.uniforms['circles'].value[this.circlesCount]['radius'] = 500;
            this.uniforms['circles'].value[this.circlesCount]['worldOrigin'] = new Vector3(6484614.558396748, 0, -2705261.510353672);
            this.circlesCount += 1;
            this.uniforms['circlesCount'].value = this.circlesCount;
        },
    };

    update = {
        circle: {
            geoposition: (index: number, geoposition: number) => {
                // this.shader.uniforms['circles'].value[index] = new Vector3()
            },
            radius: (index: number, radius: number) => {
                this.uniforms['circles'].value[index]['radius'] = radius;
            },
        },
    };

    addShader = (shader: Shader) => {
        if (!this.uniforms) {
            const uniforms = shader.uniforms;
            this.setup(uniforms);
            this.uniforms = uniforms;
        }

        shader.uniforms = this.uniforms;
    };

    createCircle = () => {

    };

    private setup = (uniforms: Uniforms) => {
        this.setupCircles(uniforms);
    };

    private setupCircles = (uniforms: Uniforms) => {
        const circles: object[] = [];
        for (let index = 0; index < constants.circles.limit; index++) {
            circles.push({
                worldOrigin: new Vector3(),
			    radius: 0,
            });
        }
		uniforms['circles'] = new Uniform(circles);
        uniforms['circlesCount'] = new Uniform(0);
    };
}

export const rootUniforms = new ShaderUniforms();
