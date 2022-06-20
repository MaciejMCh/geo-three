import { BoxGeometry, BufferAttribute, BufferGeometry, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Uniform, Vector4 } from 'three';
import { RenderEnviroment } from '../RenderEnviroment';
import { editLines } from '../utils/shderEditor';

export class Pin {
    constructor(private mesh: Mesh) {}

    static make = (renderEnviroment: RenderEnviroment) => {
        setInterval(() => {
            console.log(renderEnviroment.worldCamera.projectionMatrix);
        }, 1000);
        const mesh = makePinMesh();
        renderEnviroment.worldScene.add(mesh);
        return new Pin(mesh);
    };

    updateGeometry = () => {

    };

    displayBackground = () => {

    };   
}

const makePinMesh = () => {
    // /////////////// proof of xd
    // const dim = 1000000;
    // const geometry = new BoxGeometry(dim, dim, dim);
    // geometry.translate(0, -5 * dim, 0);
    // const material = new MeshBasicMaterial( {color: 0xff00ff} );
    // const cube = new Mesh( geometry, material );
    
    // material.depthTest = false;
    // material.depthWrite = false;
    // cube.renderOrder = 1;
    
    // return cube;
    // ///////////////////////////////


    /////////////// proof of xd2
    const dim = 2;
    const geometry = new PlaneBufferGeometry(dim, dim);
    console.log('geometry', geometry.attributes['position']);
    const material = new MeshBasicMaterial({ color: 0xff00ff });
    material.onBeforeCompile = shader => {
        shader.vertexShader = editLines(shader.vertexShader, lines => {
			lines.splice(0, 0, [
				
			].join('\n'));
			lines.splice(lines.length - 1, 0, `
                vec3 worldPos = vec3(6488626.522566737, 0.0, -2704599.4797426015);
                vec4 framePosition = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
                gl_Position = vec4(position, 1.0);
                gl_Position = vec4(
                    (position.x * 0.1) + (framePosition.x / framePosition.z),
                    (position.y * 0.1) + (framePosition.y / framePosition.z),
                    0.0,
                    1.0
                );
			`);
		});
        // shader.vertexShader = `
        //     varying vec2 vTexel;

        //     void main() {
        //         vTexel = vec2(1.0 - ((position.x + 1.0) * 0.5), 1.0 - ((position.y + 1.0) * 0.5));
        //         gl_Position = vec4(position, 1.0);
        //     }
        // `;

        shader.fragmentShader = `
            uniform sampler2D uBufferSampler;

            void main() {
                gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }
        `;

        // shader.uniforms['uBufferSampler'] = new Uniform(bufferTexture);
    };
    const cube = new Mesh( geometry, material );
    
    material.depthTest = false;
    material.depthWrite = false;
    cube.renderOrder = 100;
    cube.frustumCulled = false;
    
    return cube;
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
