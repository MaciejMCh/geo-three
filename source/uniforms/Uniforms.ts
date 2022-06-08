import { IUniform, Shader, Uniform, Vector3, MathUtils } from 'three';
import { constants } from './constants';

export type Geoposition = {
    longitude: number;
    latitude: number;
    altitude: number;
};

type Uniforms =  { [uniform: string]: IUniform<any> };

export class DrawableIdentity {
    readonly raw = MathUtils.generateUUID();
}

export class ShaderUniforms {
    private circlesCount = 0;

    private uniforms!: Uniforms;

    private circlesByIds: Record<string, object> = {};

    create = {
        circle: () => {
            const identity = new DrawableIdentity();
            this.circlesByIds[identity.raw] = this.uniforms['circles'].value[this.circlesCount];
            this.uniforms['circles'].value[this.circlesCount]['radius'] = 500;
            this.uniforms['circles'].value[this.circlesCount]['worldOrigin'] = new Vector3(6484614.558396748, 0, -2705261.510353672);
            this.circlesCount += 1;
            this.uniforms['circlesCount'].value = this.circlesCount;
            return identity;
        },
    };

    update = {
        circle: {
            geoposition: (id: DrawableIdentity, geoposition: number) => {
                // this.shader.uniforms['circles'].value[index] = new Vector3()
            },
            radius: (identity: DrawableIdentity, radius: number) => {
                this.circlesByIds[identity.raw]['radius'] = radius;
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
