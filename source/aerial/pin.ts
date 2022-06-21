import { BoxGeometry, BufferAttribute, BufferGeometry, IUniform, Material, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Uniform, Vector2, Vector4 } from 'three';
import { RenderEnviroment } from '../RenderEnviroment';
import { Uniforms } from '../uniforms';
import { editLines } from '../utils/shderEditor';
import { linear, PixelSpacePoint, PixelSpatialReference } from 'geometry';

export class Pin {
    private uniforms?: Uniforms;

    private size = linear.vec2<PixelSpatialReference>(0, 0, 'pixel');

    constructor(private mesh: Mesh) {}

    static make = (renderEnviroment: RenderEnviroment) => {
        const { mesh, uniforms } = makePinMesh();
        renderEnviroment.worldScene.add(mesh);
        const me = new Pin(mesh);

        uniforms.then(loadedUniforms => {
            me.uniformsDidLoad(loadedUniforms);
        });

        return me;
    };

    uniformsDidLoad = (uniforms: Uniforms) => {
        this.uniforms = uniforms;
        this.updateSize(this.size);
    };

    updateGeometry = () => {
        
    };

    displayBackground = () => {

    };

    updateSize = (size: PixelSpacePoint) => {
        this.size = size;

        if (!this.uniforms) {
            return;
        }

        this.uniforms['uSizeFactors'].value = this.sizeFactors(size);
    };

    sizeFactors = (size: PixelSpacePoint) => new Vector2(
        size.x / window.innerWidth,
        size.y / window.innerHeight,
    );
}

const makePinMesh = () => {
    var didLoadUniforms: (uniforms: Uniforms) => void;

    const uniformsPromise = new Promise<Uniforms>(resolve => {
        didLoadUniforms = resolve;
    });

    const dim = 2;
    const geometry = new PlaneBufferGeometry(dim, dim);
    const material = new MeshBasicMaterial({ color: 0xff00ff });
    material.onBeforeCompile = shader => {
        shader.vertexShader = editLines(shader.vertexShader, lines => {
			lines.splice(0, 0, [
				'uniform vec2 uSizeFactors;'
			].join('\n'));
			lines.splice(lines.length - 1, 0, `
                vec3 worldPos = vec3(6488626.522566737, 0.0, -2704599.4797426015);
                vec4 framePosition = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
                gl_Position = vec4(position, 1.0);
                gl_Position = vec4(
                    (position.x * uSizeFactors.x) + (framePosition.x / framePosition.z),
                    (position.y * uSizeFactors.y) + (framePosition.y / framePosition.z),
                    0.0,
                    1.0
                );
			`);
		});

        shader.fragmentShader = `
            uniform sampler2D uBufferSampler;

            void main() {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }
        `;

        shader.uniforms['uSizeFactors'] = new Uniform(new Vector2());
        didLoadUniforms(shader.uniforms);
    };
    const cube = new Mesh( geometry, material );
    
    material.depthTest = false;
    material.depthWrite = false;
    cube.renderOrder = 100;
    cube.frustumCulled = false;
    
    return { mesh: cube, uniforms: uniformsPromise };
    ///////////////////////////////

    // const material = new MeshBasicMaterial({ color: 0xff00ff });
    // material.onBeforeCompile = shader => {
    //     shader.vertexShader = `
    //         varying vec2 vTexel;

    //         void main() {
    //             vTexel = vec2(1.0 - ((position.x + 1.0) * 0.5), 1.0 - ((position.y + 1.0) * 0.5));
    //             gl_Position = vec4(position, 1.0);
    //         }
    //     `;

    //     shader.fragmentShader = `
    //         varying vec2 vTexel;
    //         uniform sampler2D uBufferSampler;

    //         void main() {
    //             gl_FragColor = texture2D(uBufferSampler, vTexel);
    //             gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    //         }
    //     `;

    //     // shader.uniforms['uBufferSampler'] = new Uniform(bufferTexture);
    // };
    // material.depthTest = false;
    // const geometry = new BufferGeometry();
    // const vertices = [
    //     // 0, 0, 0,
    //     // // 0, 1, 0,
    //     // 1, 1, 0,
    //     // 0, 1, 0,

    //     0, 0, 0,
    //     // 0, 0, 1,
    //     1, 0, 1,
    //     0, 0, 1,
    // ]
    // geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
    // const mesh = new Mesh(geometry, material);
    // return mesh;
};
