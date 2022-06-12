import { BoxGeometry, BufferAttribute, BufferGeometry, Camera, Color, DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, PlaneBufferGeometry, Scene, ShapeBufferGeometry, WebGLRenderer, WebGLRenderTarget } from 'three';
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

    static make = () => {
        var camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.00001, 1000000 );
        var bufferScene = new Scene();
        var bufferTexture = new WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: LinearFilter, magFilter: NearestFilter});
        var redMaterial = new MeshBasicMaterial({color:0xF06565});
        var boxGeometry = new BoxGeometry( 5, 5, 5 );
        var boxObject = new Mesh( boxGeometry, redMaterial );
        boxObject.position.z = -10; 
        var blueMaterial = new MeshBasicMaterial({color:0x7074FF})
        var plane = new PlaneBufferGeometry( window.innerWidth, window.innerHeight );
        var planeObject = new Mesh(plane,blueMaterial);
        planeObject.position.z = -15;
        var boxMaterial = new MeshBasicMaterial({ map:bufferTexture.texture });
        const vertices = new Float32Array( [
            0.5,  0.5,  0.0,
            -0.5,  0.5,  0.0,
            -0.5, -0.5,  0.0
        ]);
        const geometry = new BufferGeometry();
        geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );
        const material = new MeshBasicMaterial( { color: 0xff0000 } );

        material.onBeforeCompile = shader => {
            shader.vertexShader = `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `;

            shader.fragmentShader = `
                void main() {
                    gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
                }
            `;
        };

        const mesh = new Mesh( geometry, material );
        bufferScene.add(mesh);

        console.log('bufferTexture', bufferTexture);
        bufferTexture.texture.name = 'buffered';

        return new Shape(bufferTexture, bufferScene, camera, mesh);
    }

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

export class Shapes {
    private readonly shapes: Shape[] = [];

    makeShape = () => {
        const shape = Shape.make();
        this.shapes.push(shape);
        return shape;
    };

    render = (webglRenderer: WebGLRenderer) => {
        this.shapes.forEach(shape => {
            shape.render(webglRenderer);
        });
    };
}
