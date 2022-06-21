import {LinearFilter, Material, MeshPhongMaterial, BufferGeometry, RGBAFormat, Texture, Vector3, Raycaster, Intersection, WebGLRenderer, Uniform, Wrapping, ClampToEdgeWrapping} from 'three';
import {MapNodeGeometry} from '../geometries/MapNodeGeometry';
import {MapNode} from './MapNode';
import {MapPlaneNode} from './MapPlaneNode';
import {UnitsUtils} from '../utils/UnitsUtils';
import {MapView} from '../MapView';
import {MapNodeHeightGeometry} from '../geometries/MapNodeHeightGeometry';
import {CanvasUtils} from '../utils/CanvasUtils';
import { constants } from '../uniforms/constants';
import { ShaderUniforms } from '../uniforms';
import { editLines } from '../utils/shderEditor';

// var xdMap!: Texture;

// const getMap = (renderer: WebGLRenderer) => {
// 	if (!xdMap) {
// 		xdMap = xd(renderer).boxMaterial.map;
// 		// xdMap.wrapS = ClampToEdgeWrapping;
// 		// xdMap.wrapT = ClampToEdgeWrapping;
// 	}

// 	return xdMap;
// };

const makeMaterial = (uniforms: ShaderUniforms, renderer: WebGLRenderer) => {
	// return xd(renderer).boxMaterial;
	const phongMaterial = new MeshPhongMaterial({ wireframe: false, color: 0xffffff });
	
	phongMaterial.onBeforeCompile = shader => {
		const varryingDeclarations = [
			'varying vec3 vWorldPosition;',
			'varying float vDepth;',
		];
		shader.vertexShader = editLines(shader.vertexShader, lines => {
			lines.splice(0, 0, [
				...varryingDeclarations,
			].join('\n'));
			lines.splice(lines.length - 1, 0, `
				vec4 worldPosition = vec4(transformed, 1.0);
				worldPosition = modelMatrix * worldPosition;
				vWorldPosition = vec3(worldPosition);
				vDepth = gl_Position.w;
			`);
		});

		shader.fragmentShader = editLines(shader.fragmentShader, lines => {
			lines.splice(0, 0, [
				...varryingDeclarations,
				`
					struct Circle {
						vec3 worldOrigin;
						float radius;
						vec3 color;
					};

					struct LinearFunction {
						float a;
						float b;
					};

					struct LinearTransform2d {
						LinearFunction x;
						LinearFunction y;
					};

					struct Shape {
						LinearTransform2d worldToFrameTransform;
						sampler2D bufferSampler;
					};
				`,
				`
					vec2 transformLinear(vec2 vector, LinearTransform2d linearTransform) {
						return vec2(
							(vector.x * linearTransform.x.a) + linearTransform.x.b,
							(vector.y * linearTransform.y.a) + linearTransform.y.b
						);
					}
				`,
				`
					vec4 circleColor(Circle circle, vec3 worldPosition, float depth) {
						float dist = distance(worldPosition, circle.worldOrigin);
						float otherLimit = circle.radius - (depth * 0.004);
						bool isRed = dist < circle.radius && dist > otherLimit;
						if (isRed) {
							float angle = atan(circle.worldOrigin.z - worldPosition.z, circle.worldOrigin.x - worldPosition.x);
							if (mod(angle * circle.radius * 0.04, 2.0) < 1.0) {
								return vec4(circle.color, 1.0);
							} else {
								return vec4(0.0, 0.0, 0.0, 0.0);
							}
						} else {
							return vec4(0.0, 0.0, 0.0, 0.0);
						}
					}
				`,
				`
					vec4 shapesColor(LinearTransform2d worldToFrameTransform, vec3 worldPosition, sampler2D bufferSampler) {
						vec2 worldTexel = transformLinear(vec2(worldPosition.x, worldPosition.z), worldToFrameTransform);
						if (worldTexel.x > 0.0 && worldTexel.x < 1.0 && worldTexel.y > 0.0 && worldTexel.y < 1.0) {
							//return vec4(1.0, 0.0, 1.0, 0.5);
							return texture2D(bufferSampler, worldTexel);
						} else {
							return vec4(0.0, 0.0, 0.0, 0.0);
						}
					}
				`,
				`uniform Circle circles[${constants.circles.limit}];`,
				'uniform int circlesCount;',
				'uniform LinearTransform2d uShapesWorldToFrameTransform;',
				'uniform sampler2D uShapesBufferSampler;',
			].join('\n'));

			lines.splice(lines.length - 1, 0, `
				vec4 shapesColor = shapesColor(uShapesWorldToFrameTransform, vWorldPosition, uShapesBufferSampler);
				gl_FragColor = mix(gl_FragColor, shapesColor, shapesColor.a);

				for (int i = 0; i <= circlesCount; i++) {
					vec4 circleColor = circleColor(circles[i], vWorldPosition, vDepth);
					gl_FragColor = mix(gl_FragColor, circleColor, circleColor.a);
				}
			`);
		});

		uniforms.addShader(shader);
		// shader.uniforms['tSec'] = new Uniform(getMap(renderer));
	};

	return phongMaterial;
};

/**
 * Represents a height map tile node that can be subdivided into other height nodes.
 *
 * Its important to update match the height of the tile with the neighbors nodes edge heights to ensure proper continuity of the surface.
 *
 * The height node is designed to use MapBox elevation tile encoded data as described in https://www.mapbox.com/help/access-elevation-data/
 */
export class MapHeightNode extends MapNode 
{
	/**
	 * Flag indicating if the tile height data was loaded.
	 */
	public heightLoaded: boolean = false;

	/**
	 * Flag indicating if the tile texture was loaded.
	 */
	public textureLoaded: boolean = false;

	/**
	 * Original tile size of the images retrieved from the height provider.
	 */
	public static tileSize: number = 256;

	/**
	 * Size of the grid of the geometry displayed on the scene for each tile.
	 */
	public geometrySize: number = 16;

	/**
	 * If true the tiles will compute their normals.
	 */
	public geometryNormals: boolean = false;

	/**
	 * Map node plane geometry.
	 */
	public static geometry: BufferGeometry = new MapNodeGeometry(1, 1, 1, 1);

	public static baseGeometry: BufferGeometry = MapPlaneNode.geometry;

	public static baseScale: Vector3 = new Vector3(UnitsUtils.EARTH_PERIMETER, 1, UnitsUtils.EARTH_PERIMETER);

	/**
	 * Map height node constructor.
	 *
	 * @param parentNode - The parent node of this node.
	 * @param mapView - Map view object where this node is placed.
	 * @param location - Position in the node tree relative to the parent.
	 * @param level - Zoom level in the tile tree of the node.
	 * @param x - X position of the node in the tile tree.
	 * @param y - Y position of the node in the tile tree.
	 * @param material - Material used to render this height node.
	 * @param geometry - Geometry used to render this height node.
	 */
	public constructor(
		private uniforms: ShaderUniforms,
		private renderer: WebGLRenderer,
		parentNode: MapHeightNode = null,
		mapView: MapView = null,
		location: number = MapNode.root,
		level: number = 0,
		x: number = 0,
		y: number = 0,
		geometry: BufferGeometry = MapHeightNode.geometry,
		material: Material = makeMaterial(uniforms, renderer),
	)
	{
		super(parentNode, mapView, location, level, x, y, geometry, material);
		if (!uniforms) {
			console.trace();
		}

		this.isMesh = true;
		this.visible = false;
		this.matrixAutoUpdate = false;
	}

	public initialize(): void 
	{
		super.initialize();

		this.loadTexture();
		this.loadHeightGeometry();
	}

	/**
	 * Load tile texture from the server.
	 *
	 * Aditionally in this height node it loads elevation data from the height provider and generate the appropiate maps.
	 */
	identity() {
		return `MapHeighNode-${this.level}/${this.x}/${this.y}`;
	}

	public async loadTexture(): Promise<void> 
	{
		const texture = new Texture();
		texture.name = `${this.identity()}_texture`;
		texture.image = await this.mapView.provider.fetchTile(this.level, this.x, this.y);
		texture.generateMipmaps = false;
		texture.format = RGBAFormat;
		texture.magFilter = LinearFilter;
		texture.minFilter = LinearFilter;
		texture.needsUpdate = true;

		// @ts-ignore
		this.material.map = texture;
		// @ts-ignore
		this.material.needsUpdate = true;

		this.textureLoaded = true;
		this.nodeReady();
	}

	public nodeReady(): void 
	{
		if (!this.heightLoaded || !this.textureLoaded) 
		{
			return;
		}

		this.visible = true;

		super.nodeReady();
	}

	public createChildNodes(): void 
	{
		const level = this.level + 1;
		const Constructor = Object.getPrototypeOf(this).constructor;

		const x = this.x * 2;
		const y = this.y * 2;
		let node = new Constructor(this.uniforms, this.renderer, this, this.mapView, MapNode.topLeft, level, x, y);
		node.scale.set(0.5, 1.0, 0.5);
		node.position.set(-0.25, 0, -0.25);
		this.add(node);
		node.updateMatrix();
		node.updateMatrixWorld(true);

		node = new Constructor(this.uniforms, this.renderer, this, this.mapView, MapNode.topRight, level, x + 1, y);
		node.scale.set(0.5, 1.0, 0.5);
		node.position.set(0.25, 0, -0.25);
		this.add(node);
		node.updateMatrix();
		node.updateMatrixWorld(true);

		node = new Constructor(this.uniforms, this.renderer, this, this.mapView, MapNode.bottomLeft, level, x, y + 1);
		node.scale.set(0.5, 1.0, 0.5);
		node.position.set(-0.25, 0, 0.25);
		this.add(node);
		node.updateMatrix();
		node.updateMatrixWorld(true);

		node = new Constructor(this.uniforms, this.renderer, this, this.mapView, MapNode.bottomRight, level, x + 1, y + 1);
		node.scale.set(0.5, 1.0, 0.5);
		node.position.set(0.25, 0, 0.25);
		this.add(node);
		node.updateMatrix();
		node.updateMatrixWorld(true);
	}

	/**
	 * Load height texture from the server and create a geometry to match it.
	 *
	 * @returns Returns a promise indicating when the geometry generation has finished.
	 */
	public async loadHeightGeometry(): Promise<any> 
	{
		if (this.mapView.heightProvider === null) 
		{
			throw new Error('GeoThree: MapView.heightProvider provider is null.');
		}

		const image = await this.mapView.heightProvider.fetchTile(this.level, this.x, this.y);

		const canvas = CanvasUtils.createOffscreenCanvas(this.geometrySize + 1, this.geometrySize + 1);

		const context = canvas.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.drawImage(image, 0, 0, MapHeightNode.tileSize, MapHeightNode.tileSize, 0, 0, canvas.width, canvas.height);

		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

		this.geometry = new MapNodeHeightGeometry(1, 1, this.geometrySize, this.geometrySize, true, 10.0, imageData, true);
		this.heightLoaded = true;
		this.nodeReady();
	}

	/**
	 * Overrides normal raycasting, to avoid raycasting when isMesh is set to false.
	 */
	public raycast(raycaster: Raycaster, intersects: Intersection[]): void
	{
		if (this.isMesh === true) 
		{
			return super.raycast(raycaster, intersects);
		}

		// @ts-ignore
		return false;
	}
}
