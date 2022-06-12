import { Camera, Color, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, Scene, ShapeBufferGeometry, Texture, Vector2, WebGLRenderer, WebGLRenderTarget, Shape as ThreeShape, Uniform, BufferGeometry } from 'three';
import { Geometry } from './geometries';

type ShapeRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapeScene: Scene;
    camera: Camera;
};

class SimpleGeometry {
    constructor(private mesh: Mesh, private invalidate: () => void) {}

    updateGeometry = (geometry: Geometry) => {
        this.mesh.geometry = geometry.shapeGeometry;
        this.invalidate();
    };
}

export class Shape {
    private needsRender = true;

    constructor(private debugIdentity: string, private setup: ShapeRenderSetup) {}

    render = (webglRenderer: WebGLRenderer) => {
        if (!this.needsRender) {
            return;
        }
        console.log('render shape', this.debugIdentity, this.setup.shapeScene.children);
        webglRenderer.setRenderTarget(this.setup.bufferRenderTarget);
        webglRenderer.render(this.setup.shapeScene, this.setup.camera);
        this.needsRender = false;
    };

    useSimpleGeometry = (): SimpleGeometry => {
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        material.onBeforeCompile = shader => {
            shader.vertexShader = `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `;
    
            shader.fragmentShader = `
                void main() {
                    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
                }
            `;
        };
        const mesh = new Mesh(new ShapeBufferGeometry(), material);
        this.setup.shapeScene.add(mesh);
        this.invalidate();
        return new SimpleGeometry(mesh, this.invalidate);
    };

    invalidate = () => {
        this.needsRender = true;
    };
}

type ShapesRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapesStackScene: Scene;
    camera: Camera;
};

const setupShapesRender = (): ShapesRenderSetup => {
    const camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000000 );
    const bufferScene = new Scene();
    bufferScene.name = 'shapes_scene';
    bufferScene.background = new Color('green');
    const bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
    bufferTexture.texture.name = 'shapes_buffer-texture';
    return { bufferRenderTarget: bufferTexture, camera, shapesStackScene: bufferScene };
};

const makeShapeLayer = (bufferTexture: Texture) => {
    const geometry = new ShapeBufferGeometry(new ThreeShape([
        new Vector2(1, 1),
        new Vector2(1, -1),
        new Vector2(-1, -1),
        new Vector2(-1, 1),
    ]));
    const material = new MeshBasicMaterial({ color: 0xff0000 });

    material.onBeforeCompile = shader => {
        shader.vertexShader = `
            varying vec2 vTexel;

            void main() {
                vTexel = vec2(1.0 - ((position.x + 1.0) * 0.5), 1.0 - ((position.y + 1.0) * 0.5));
                gl_Position = vec4(position, 1.0);
            }
        `;

        shader.fragmentShader = `
            varying vec2 vTexel;
            uniform sampler2D uBufferSampler;

            void main() {
                gl_FragColor = texture2D(uBufferSampler, vTexel);
            }
        `;

        shader.uniforms['uBufferSampler'] = new Uniform(bufferTexture);
    };

    const mesh = new Mesh(geometry, material);

    return { mesh };
};

const setupShapeRender = (debugIdentity: string): ShapeRenderSetup => {
    const camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000000 );
    const bufferScene = new Scene();
    bufferScene.name = `shape-${debugIdentity}_scene`;
    bufferScene.background = new Color('blue');
    const bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
    bufferTexture.texture.name = `shape-${debugIdentity}_buffer-texture`;
    return { bufferRenderTarget: bufferTexture, camera, shapeScene: bufferScene };
};

export class Shapes {
    private readonly shapes: Shape[] = [];
    
    private readonly setup: ShapesRenderSetup;

    get bufferTexture() {
        return this.setup.bufferRenderTarget.texture;
    }

    constructor() {
        this.setup = setupShapesRender();
    }

    makeShape = (debugIdentity: string) => {
        const setup = setupShapeRender(debugIdentity);
        const shapeLayer = makeShapeLayer(setup.bufferRenderTarget.texture);
        this.setup.shapesStackScene.add(shapeLayer.mesh);
        
        const shape = new Shape(debugIdentity, setup);
        this.shapes.push(shape);
        return shape;
    };

    render = (webglRenderer: WebGLRenderer) => {
        this.shapes.forEach(shape => {
            shape.render(webglRenderer);
        });

        console.log('render shapes');
        webglRenderer.setRenderTarget(this.setup.bufferRenderTarget);
        webglRenderer.render(this.setup.shapesStackScene, this.setup.camera);
    };
}
