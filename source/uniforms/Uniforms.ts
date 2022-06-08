import { IUniform, Shader, Uniform, Vector3, MathUtils } from 'three';
import { Geoposition } from '../nodes/primitive';
import { constants } from './constants';

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
            this.circlesCount += 1;
            this.uniforms['circlesCount'].value = this.circlesCount;
            return identity;
        },
    };

    update = {
        circle: {
            geoposition: (identity: DrawableIdentity, geoposition: Geoposition) => {
                this.circlesByIds[identity.raw]['worldOrigin'] = geoposition.worldPosition;
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
