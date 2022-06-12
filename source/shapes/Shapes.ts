import { BoxGeometry, BufferAttribute, BufferGeometry, Camera, Color, LinearFilter, Mesh, MeshBasicMaterial, NearestFilter, PerspectiveCamera, PlaneBufferGeometry, Scene, ShapeBufferGeometry, WebGLRenderer, WebGLRenderTarget } from 'three';
import { editLines } from '../utils/shderEditor';

class Shape {
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
        var camera = new PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
        var bufferScene = new Scene();
        bufferScene.background = new Color('green');
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
            const varryingDeclarations = [
                'varying float vColor;'
            ];
            shader.vertexShader = editLines(shader.vertexShader, lines => {
                lines.splice(0, 0, [
                    ...varryingDeclarations,
                ].join('\n'));
                lines.splice(lines.length - 1, 0, `
                    vColor = position.x;
                    gl_Position = vec4(position, 1.0);
                `);
            });

            shader.fragmentShader = editLines(shader.fragmentShader, lines => {
                lines.splice(0, 0, [
                    ...varryingDeclarations,
                ].join('\n'));
                lines.splice(lines.length - 1, 0, `
                    gl_FragColor = vec4(vColor, vColor, vColor, 1.0);
                `);
            });
        };

        const mesh = new Mesh( geometry, material );
        bufferScene.add(mesh);

        console.log('bufferTexture', bufferTexture);
        bufferTexture.texture.name = 'buffered';

        return new Shape(bufferTexture, bufferScene, camera, mesh);
    }

    updateGeometry = (geometry: ShapeBufferGeometry) => {
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
        })
    };
}
