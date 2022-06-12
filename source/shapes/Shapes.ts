import { Camera, Color, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, Scene, ShapeBufferGeometry, Texture, Vector2, WebGLRenderer, WebGLRenderTarget, Shape as ThreeShape, Uniform, BufferGeometry, LineSegments, EdgesGeometry, LineBasicMaterial } from 'three';
import { Geometry } from './geometries';

type ShapeRenderSetup = {
    bufferRenderTarget: WebGLRenderTarget;
    shapeScene: Scene;
    camera: Camera;
};

class SimpleGeometry {
    constructor(private readonly mesh: Mesh, private invalidate: () => void) {}

    updateGeometry = (geometry: Geometry) => {
        this.mesh.geometry = geometry.shapeGeometry;
        this.invalidate();
    };
}

class PathGeometry {
    constructor(public readonly mesh: LineSegments, private invalidate: () => void) {}

    updateGeometry = (geometry: Geometry) => {
        this.mesh.geometry = new EdgesGeometry(geometry.shapeGeometry);
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
        const material = new MeshBasicMaterial({ color: 0xffffff });
        const mesh = new Mesh(new ShapeBufferGeometry(), material);
        mesh.name = `${this.debugIdentity}_simple-geometry-mesh`;
        this.setup.shapeScene.add(mesh);
        this.invalidate();
        return new SimpleGeometry(mesh, this.invalidate);
    };

    usePathGeometry = (): PathGeometry => {
        const geometry = new EdgesGeometry();
        const material = new LineBasicMaterial({ color: 0xff00ff,5 });
        const wireframe = new LineSegments(geometry, material);
        wireframe.name = `${this.debugIdentity}_path-geometry-mesh`;
        this.setup.shapeScene.add(wireframe);
        return new PathGeometry(wireframe, this.invalidate);
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
    const bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
    bufferTexture.texture.name = 'shapes_buffer-texture';
    return { bufferRenderTarget: bufferTexture, camera, shapesStackScene: bufferScene };
};

const makeShapeLayer = (debugIdentity: string, bufferTexture: Texture) => {
    const geometry = new ShapeBufferGeometry(new ThreeShape([
        new Vector2(1, 1),
        new Vector2(1, -1),
        new Vector2(-1, -1),
        new Vector2(-1, 1),
    ]));
    const material = new MeshBasicMaterial({ color: 0xff0000, depthTest: false, transparent: true });

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
    mesh.name = `${debugIdentity}-shape-layer-mesh`;

    return { mesh };
};

const setupShapeRender = (debugIdentity: string): ShapeRenderSetup => {
    const camera = new Camera();
    const bufferScene = new Scene();
    bufferScene.name = `shape-${debugIdentity}_scene`;
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
        console.log('make shape', debugIdentity);
        const setup = setupShapeRender(debugIdentity);
        const shapeLayer = makeShapeLayer(debugIdentity, setup.bufferRenderTarget.texture);
        this.setup.shapesStackScene.add(shapeLayer.mesh);
        
        const shape = new Shape(debugIdentity, setup);
        this.shapes.push(shape);
        return shape;
    };

    render = (webglRenderer: WebGLRenderer) => {
        this.shapes.forEach(shape => {
            shape.render(webglRenderer);
        });

        // console.log('render shapes', this.setup.shapesStackScene.children);
        webglRenderer.setRenderTarget(this.setup.bufferRenderTarget);
        webglRenderer.render(this.setup.shapesStackScene, this.setup.camera);
    };
}
