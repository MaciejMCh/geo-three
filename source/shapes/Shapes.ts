import { BoxGeometry, BufferAttribute, BufferGeometry, Camera, Color, DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, PlaneBufferGeometry, Scene, ShapeBufferGeometry, Texture, WebGLRenderer, WebGLRenderTarget } from 'three';
import { editLines } from '../utils/shderEditor';

export class Shape {
    get bufferSampler() {
        return this.bufferTexture.texture;
    }

    constructor(
        private readonly bufferTexture: WebGLRenderTarget,
        private readonly bufferScene: Scene,
        private readonly camera: Camera,
        private readonly mesh: Mesh,
    ) {}

    // static make = () => {
    //     var camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000000 );
    //     var bufferScene = new Scene();
    //     bufferScene.name = 'shapes_scene';
    //     bufferScene.background = new Color('green');
    //     var bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
    //     const geometry = new BufferGeometry();
    //     const material = new MeshBasicMaterial( { color: 0xff0000 } );

    //     material.onBeforeCompile = shader => {
    //         shader.vertexShader = `
    //             void main() {
    //                 gl_Position = vec4(position, 1.0);
    //             }
    //         `;

    //         shader.fragmentShader = `
    //             void main() {
    //                 gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    //             }
    //         `;
    //     };

    //     const mesh = new Mesh( geometry, material );
    //     bufferScene.add(mesh);
    //     bufferTexture.texture.name = 'shapes_buffer-texture';
    //     return new Shape(bufferTexture, bufferScene, camera, mesh);
    // }

    updateGeometry = (geometry: ShapeBufferGeometry) => {
        console.log('update geometry', geometry);
        this.mesh.geometry = geometry;
    };

    render = (webglRenderer: WebGLRenderer) => {
        console.log('render shape');
        webglRenderer.setRenderTarget(this.bufferTexture);
        webglRenderer.render(this.bufferScene, this.camera);
    };
}

type ShapesRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapesStackScene: Scene;
    camera: Camera;
}

const setupShapesRender = (): ShapesRenderSetup => {
    const camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000000 );
    const bufferScene = new Scene();
    bufferScene.name = 'shapes_scene';
    bufferScene.background = new Color('green');
    const bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
    // const geometry = new BufferGeometry();
    // const material = new MeshBasicMaterial( { color: 0xff0000 } );

    // material.onBeforeCompile = shader => {
    //     shader.vertexShader = `
    //         void main() {
    //             gl_Position = vec4(position, 1.0);
    //         }
    //     `;

    //     shader.fragmentShader = `
    //         void main() {
    //             gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    //         }
    //     `;
    // };

    // const mesh = new Mesh( geometry, material );
    // bufferScene.add(mesh);
    bufferTexture.texture.name = 'shapes_buffer-texture';
    return { bufferRenderTarget: bufferTexture, camera, shapesStackScene: bufferScene };
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

    // makeShape = () => {
    //     const shape = Shape.make();
    //     this.shapes.push(shape);
    //     return shape;
    // };

    render = (webglRenderer: WebGLRenderer) => {
        this.shapes.forEach(shape => {
            shape.render(webglRenderer);
        });

        console.log('render shapes');
        webglRenderer.setRenderTarget(this.setup.bufferRenderTarget);
        webglRenderer.render(this.setup.shapesStackScene, this.setup.camera);
    };
}
