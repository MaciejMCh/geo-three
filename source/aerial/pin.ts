import { Color, Mesh, MeshBasicMaterial, PlaneBufferGeometry, TextureLoader, Uniform, Vector2, Vector3 } from 'three';
import { RenderEnviroment } from '../RenderEnviroment';
import { Uniforms } from '../uniforms';
import { editLines } from '../utils/shderEditor';
import { GeographicToProjectedConversion, linear, PixelSpacePoint, PixelSpatialReference } from 'geometry';

export class Pin {
    private uniforms?: Uniforms;

    private size = linear.vec2<PixelSpatialReference>(0, 0, 'pixel');

    private position?: GeographicToProjectedConversion;

    private isCircle = false;

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
        if (this.position) {
            this.updatePosition(this.position);
        }
        this.updateIsCircle(this.isCircle);
    };

    displayImage = (url: string) => {
        (this.mesh.material as MeshBasicMaterial).map = new TextureLoader().load(url);
    };

    displayOval = (color: string) => {
        (this.mesh.material as MeshBasicMaterial).color = new Color(color);
        this.updateIsCircle(true);
    };

    updatePosition = (position: GeographicToProjectedConversion) => {
        this.position = position;

        if (!this.uniforms) {
            return;
        }

        const positionVector = new Vector3(position.worldSurfacePosition.x, 0, position.worldSurfacePosition.y);
        this.uniforms['uWorldPosition'].value = positionVector;
    };

    updateSize = (size: PixelSpacePoint) => {
        this.size = size;

        if (!this.uniforms) {
            return;
        }

        this.uniforms['uSizeFactors'].value = this.sizeFactors(size);
    };

    updateIsCircle = (isCircle: boolean) => {
        this.isCircle = isCircle;

        if (!this.uniforms) {
            return;
        }

        this.uniforms['uIsCircle'].value = isCircle;
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
    const material = new MeshBasicMaterial();
    material.onBeforeCompile = shader => {
        shader.vertexShader = editLines(shader.vertexShader, lines => {
			lines.splice(0, 0, [
				'uniform vec2 uSizeFactors;',
                'uniform vec3 uWorldPosition;',
                'varying vec2 vTexel;',
			].join('\n'));
			lines.splice(lines.length - 1, 0, `
                vec4 framePosition = projectionMatrix * viewMatrix * vec4(uWorldPosition, 1.0);
                gl_Position = vec4(position, 1.0);
                gl_Position = vec4(
                    (position.x * uSizeFactors.x) + (framePosition.x / framePosition.z),
                    (position.y * uSizeFactors.y) + (framePosition.y / framePosition.z),
                    0.0,
                    1.0
                );
                vTexel = uv;
			`);
		});

        shader.fragmentShader = editLines(shader.fragmentShader, lines => {
            lines.splice(0, 0, [
				'varying vec2 vTexel;',
                'uniform bool uIsCircle;',
			].join('\n'));
			lines.splice(lines.length - 1, 0, `
                if (uIsCircle) {
                    float radius = distance(vTexel, vec2(0.5, 0.5));
                    if (radius > 0.5) {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                    } else if (radius > 0.45) {
                        gl_FragColor = vec4(0.953, 0.573, 0.0, 1.0);
                    }
                }
			`);
        });

        shader.uniforms['uSizeFactors'] = new Uniform(new Vector2());
        shader.uniforms['uWorldPosition'] = new Uniform(new Vector3());
        shader.uniforms['uIsCircle'] = new Uniform(false);
        didLoadUniforms(shader.uniforms);
    };
    const mesh = new Mesh( geometry, material );
    
    material.depthTest = false;
    material.depthWrite = false;
    mesh.renderOrder = 100;
    mesh.frustumCulled = false;

    material.transparent = true;
    
    return { mesh: mesh, uniforms: uniformsPromise };
};
