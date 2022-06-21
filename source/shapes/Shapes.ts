import { Camera, Color, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, Scene, ShapeBufferGeometry, Texture, Vector2, WebGLRenderer, WebGLRenderTarget, Shape as ThreeShape, Uniform, BufferGeometry, LineSegments, EdgesGeometry, LineBasicMaterial } from 'three';
import { ModelUpdateLoop } from '../uniforms/ModelUpdateLoop';
import { editLines } from '../utils/shderEditor';
import { Geometry } from './geometries';

const frameBufferSize = () => {
    return {
        width: window.innerWidth * window.devicePixelRatio * 2,
        height: window.innerHeight * window.devicePixelRatio * 2,
    };
}

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

    public continousRerender = false;

    constructor(private debugIdentity: string, private setup: ShapeRenderSetup) {}

    render = (webglRenderer: WebGLRenderer) => {
        if (!this.needsRender && !this.continousRerender) {
            return;
        }
        //console.log('render shape', this.debugIdentity, this.setup.shapeScene.children);
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

    useLineGeometry = (updateLoop: ModelUpdateLoop): SimpleGeometry => {
        const material = new MeshBasicMaterial({ color: 0xffff00 });

        material.onBeforeCompile = shader => {
            const varryingDeclarations = [
                'varying float vSide;',
                'varying float vLength;',
            ];
            shader.vertexShader = editLines(shader.vertexShader, lines => {
                lines.splice(0, 0, [
                    ...varryingDeclarations,
                    'attribute vec2 stats;'
                ].join('\n'));
                lines.splice(lines.length - 1, 0, `
                    vSide = stats[0];
                    vLength = stats[1];
                `);
            });

            shader.fragmentShader = editLines(shader.fragmentShader, lines => {
                lines.splice(0, 0, [
                    ...varryingDeclarations,
                    'uniform float uCameraDistance;'
                ].join('\n'));

                lines.splice(lines.length - 1, 0, `
                    float width = uCameraDistance;
                    float widthMask = (vSide < -width) || (vSide > width) ? 0.0 : 1.0;
                    float lengthMask = mod(vLength * 0.04, 2.0) > 1.0 ? 1.0 : 0.0;
                    float mask = widthMask * lengthMask;
                    gl_FragColor = vec4(0.463, 0.961, 1.0, mask);
                `);
            });

            const cameraDistanceUniform = new Uniform(1);
            shader.uniforms['uCameraDistance'] = cameraDistanceUniform;

            updateLoop.add(common => {
                // cameraDistanceUniform.value = common.worldCamera.position.y;
                const ratio = common.worldCamera.position.y * 0.00001;
                // console.log(ratio);
                cameraDistanceUniform.value = ratio;
            });
        };

        const mesh = new Mesh(new ShapeBufferGeometry(), material);
        mesh.name = `${this.debugIdentity}_line-geometry-mesh`;
        this.setup.shapeScene.add(mesh);
        this.invalidate();
        return new SimpleGeometry(mesh, this.invalidate);
    };

    usePathGeometry = (): PathGeometry => {
        const geometry = new EdgesGeometry();
        const material = new LineBasicMaterial({ color: 0xff00ff });
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
    const camera = new Camera();
    const bufferScene = new Scene();
    bufferScene.name = 'shapes_scene';
    const { width, height } = frameBufferSize();
    const bufferTexture = new WebGLRenderTarget( width, height, { minFilter: LinearFilter, magFilter: NearestFilter});
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
    const { width, height } = frameBufferSize();
    const bufferTexture = new WebGLRenderTarget( width, height, { minFilter: LinearFilter, magFilter: NearestFilter});
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
