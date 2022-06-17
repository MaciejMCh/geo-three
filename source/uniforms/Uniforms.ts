import { GeographicToProjectedConversion } from 'geometry/lib/spatialConversion';
import { IUniform, Shader, Uniform, Vector3, MathUtils, Texture, LinearFilter, NearestFilter, WebGLRenderTarget } from 'three';
import { constants } from './constants';
import { LinearTransform2d } from 'geometry';

type Uniforms =  { [uniform: string]: IUniform<any> };

export class DrawableIdentity {
    readonly raw = MathUtils.generateUUID();
}

export class ShaderUniforms {
    public uniforms!: Uniforms;

    private circlesByIds: Record<string, object> = {};

    private circlesCount = 0;

    private waitingForSetup: Array<() => void> = [];

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
            geoposition: (identity: DrawableIdentity, geoposition: GeographicToProjectedConversion) => {
                this.circlesByIds[identity.raw]['worldOrigin'] = geoposition.worldSurfacePosition;
            },
            radius: (identity: DrawableIdentity, radius: number) => {
                this.circlesByIds[identity.raw]['radius'] = radius;
            },
        },
        shapes: {
            worldToFrameTransform: (worldToFrameTransform: LinearTransform2d) => {
                this.uniforms['uShapesWorldToFrameTransform'].value = {
                    x: {
                        a: worldToFrameTransform.x.a,
                        b: worldToFrameTransform.x.b,
                    },
                    y: {
                        a: worldToFrameTransform.y.a,
                        b: worldToFrameTransform.y.b,
                    },
                };
            },
            bufferTexture: (shapesBufferTexture: Texture) => {
                this.uniforms['uShapesBufferSampler'] = new Uniform(shapesBufferTexture);
            },
        },
    };

    remove = {
        circle: (identity: DrawableIdentity) => {
            const circleToRemove = this.circlesByIds[identity.raw];
            const circles: object[] = this.uniforms['circles'].value;
            const indexToRemove = circles.findIndex(x => x === circleToRemove);
            circles.splice(indexToRemove, 1);
            circles.push(this.makeBlankCircle());

            this.circlesCount -= 1;
            this.uniforms['circlesCount'].value = this.circlesCount;
        },
    };

    waitForSetup = async (): Promise<void> => {
         if (this.uniforms) {
            return Promise.resolve();
         }

         return new Promise(resolve => {
            this.waitingForSetup.push(resolve);
         });
    };

    addShader = (shader: Shader) => {
        if (!this.uniforms) {
            const uniforms = shader.uniforms;
            this.uniforms = uniforms;
            this.setup(uniforms);
            
            this.waitingForSetup.forEach(resolve => {
                resolve();
            });
        }

        shader.uniforms = this.uniforms;
    };

    private setup = (uniforms: Uniforms) => {
        this.setupCircles(uniforms);
        this.setupShapes(uniforms);
    };

    private makeBlankCircle = () => ({
        worldOrigin: new Vector3(),
        radius: 0,
    });

    private setupCircles = (uniforms: Uniforms) => {
        const circles: object[] = [];
        for (let index = 0; index < constants.circles.limit; index++) {
            circles.push(this.makeBlankCircle());
        }
		uniforms['circles'] = new Uniform(circles);
        uniforms['circlesCount'] = new Uniform(0);
    };

    private setupShapes = (uniforms: Uniforms) => {
		uniforms['uShapesWorldToFrameTransform'] = new Uniform({
            x: { a: 0, b: 0 },
            y: { a: 0, b: 0 },
        });
    };
}
