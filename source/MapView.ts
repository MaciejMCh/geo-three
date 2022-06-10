import {BufferGeometry, Camera, Group, Material, Mesh, MeshBasicMaterial, Object3D, Raycaster, Scene, WebGLRenderer} from 'three';
import {OpenStreetMapsProvider} from './providers/OpenStreetMapsProvider';
import {MapNode} from './nodes/MapNode';
import {MapHeightNode} from './nodes/MapHeightNode';
import {MapPlaneNode} from './nodes/MapPlaneNode';
import {MapSphereNode} from './nodes/MapSphereNode';
import {MapHeightNodeShader} from './nodes/MapHeightNodeShader';
import {LODRaycast} from './lod/LODRaycast';
import {MapProvider} from './providers/MapProvider';
import {LODControl} from './lod/LODControl';
import {MapMartiniHeightNode} from './nodes/MapMartiniHeightNode';
import { Geoposition } from './nodes/primitive';
import { ShaderUniforms } from './uniforms';
import { xd } from './deferredRendering/deferredRendering';

/**
 * Map viewer is used to read and display map tiles from a server.
 *
 * It was designed to work with a OpenMapTiles but can also be used with another map tiles.
 *
 * The map is drawn in plane map nodes using a quad tree that is subdivided as necessary to guaratee good map quality.
 */
export class MapView extends Mesh 
{
	/**
	 * Planar map projection.
	 */
	public static PLANAR: number = 200;

	/**
	 * Spherical map projection.
	 */
	public static SPHERICAL: number = 201;

	/**
	 * Planar map projection with height deformation.
	 */
	public static HEIGHT: number = 202;

	/**
	 * Planar map projection with height deformation using the GPU for height generation.
	 */
	public static HEIGHT_SHADER: number = 203;

	/**
	 * RTIN map mode.
	 */
	public static MARTINI: number = 204;

	/**
	 * Map of the map node types available.
	 */
	public static mapModes: Map<number, any> = new Map<number, any>([
		[MapView.PLANAR, MapPlaneNode],
		[MapView.SPHERICAL, MapSphereNode],
		[MapView.HEIGHT, MapHeightNode],
		[MapView.HEIGHT_SHADER, MapHeightNodeShader],
		[MapView.MARTINI, MapMartiniHeightNode]
	]);

	/**
	 * LOD control object used to defined how tiles are loaded in and out of memory.
	 */
	public lod: LODControl = null;

	/**
	 * Map tile color layer provider.
	 */
	public provider: MapProvider = null;

	/**
	 * Map height (terrain elevation) layer provider.
	 */
	public heightProvider: MapProvider = null;

	/**
	 * Define the type of map node in use, defined how the map is presented.
	 *
	 * Should only be set on creation.
	 */
	public root: MapNode = null;

	public readonly uniforms = new ShaderUniforms();

	/**
	 * Constructor for the map view objects.
	 *
	 * @param root - Map view node modes can be SPHERICAL, HEIGHT or PLANAR. PLANAR is used by default. Can also be a custom MapNode instance.
	 * @param provider - Map color tile provider by default a OSM maps provider is used if none specified.
	 * @param heightProvider - Map height tile provider, by default no height provider is used.
	 */
	public constructor(private renderer: WebGLRenderer, root: (number | MapNode) = MapView.PLANAR, provider: MapProvider = new OpenStreetMapsProvider(), heightProvider: MapProvider = null) 
	{
		super(undefined, new MeshBasicMaterial({transparent: true, opacity: 0.0}));
		this.name = 'mapView';

		this.lod = new LODRaycast();

		this.provider = provider;
		this.heightProvider = heightProvider;

		this.setRoot(root);


	}

	/**
	 * Ajust node configuration depending on the camera distance.
	 *
	 * Called everytime before render.
	 */
	public onBeforeRender: (renderer: WebGLRenderer, scene: Scene, camera: Camera, geometry: BufferGeometry, material: Material, group: Group)=> void = (renderer, scene, camera, geometry, material, group) => 
	{
		this.lod.updateLOD(this, camera, renderer, scene);
	};

	/**
	 * Set the root of the map view.
	 *
	 * Is set by the constructor by default, can be changed in runtime.
	 *
	 * @param root - Map node to be used as root.
	 */
	public setRoot(root: (MapNode | number)): void
	{
		if (typeof root === 'number') 
		{
			if (!MapView.mapModes.has(root)) 
			{
				throw new Error('Map mode ' + root + ' does is not registered.');
			}

			const rootConstructor = MapView.mapModes.get(root);

			// @ts-ignore
			root = new rootConstructor(this.uniforms, this.renderer, null, this);
		}

		// Remove old root
		if (this.root !== null) 
		{
			this.remove(this.root);
			this.root = null;
		}

		// @ts-ignore
		this.root = root;

		// Initialize root node
		if (this.root !== null) 
		{
			// @ts-ignore
			this.geometry = this.root.constructor.baseGeometry;

			// @ts-ignore
			this.scale.copy(this.root.constructor.baseScale);

			this.root.mapView = this;
			this.add(this.root);

			setTimeout(() => {
				const identity1 = this.uniforms.create.circle();
				const identity2 = this.uniforms.create.circle();
				this.uniforms.update.circle.radius(identity1, 10000);
				this.uniforms.update.circle.geoposition(identity1, new Geoposition({ longitude: 58.283998864, latitude: 23.589330976 }));
				this.uniforms.update.circle.radius(identity2, 5000);
				this.uniforms.update.circle.geoposition(identity2, new Geoposition({ longitude: 58.283998864, latitude: 23.589330976 }));
				setTimeout(() => {
					this.uniforms.remove.circle(identity2); // remove smaller;
				}, 1000);
			}, 3000);

			function eToNumber(num) {
				let sign = "";
				(num += "").charAt(0) == "-" && (num = num.substring(1), sign = "-");
				let arr = num.split(/[e]/ig);
				if (arr.length < 2) return sign + num;
				let dot = (.1).toLocaleString().substr(1, 1), n = arr[0], exp = +arr[1],
					w = (n = n.replace(/^0+/, '')).replace(dot, ''),
				  pos = n.split(dot)[1] ? n.indexOf(dot) + exp : w.length + exp,
				  L   = pos - w.length, s = "" + BigInt(w);
				  w   = exp >= 0 ? (L >= 0 ? s + "0".repeat(L) : r()) : (pos <= 0 ? "0" + dot + "0".repeat(Math.abs(pos)) + s : r());
				L= w.split(dot); if (L[0]==0 && L[1]==0 || (+w==0 && +s==0) ) w = 0; //** added 9/10/2021
				return sign + w;
				function r() {return w.replace(new RegExp(`^(.{${pos}})(.)`), `$1${dot}$2`)}
			  }

			setTimeout(() => {
				const ax = document.getElementById('ax') as HTMLInputElement;
				ax.value = eToNumber(this.uniforms.uniforms['shape'].value['aX']);
				ax.onchange = () => {
					console.log('before', this.uniforms.uniforms['shape'].value['aX']);
					this.uniforms.uniforms['shape'].value['aX'] = parseFloat(ax.value.replace(',', '.'));
					console.log('after', this.uniforms.uniforms['shape'].value['aX']);
				};

				const bx = document.getElementById('bx') as HTMLInputElement;
				bx.value = this.uniforms.uniforms['shape'].value['bX'];
			}, 1000);
			

			// setTimeout(() => {
			// 	const { bufferTexture } = xd();
			// 	bufferTexture.texture.name = 'deferred';
			// }, 1000);
		}
	}

	/**
	 * Change the map provider of this map view.
	 *
	 * Will discard all the tiles already loaded using the old provider.
	 */
	public setProvider(provider: MapProvider): void
	{
		if (provider !== this.provider) 
		{
			this.provider = provider;
			this.clear();
		}
	}

	/**
	 * Change the map height provider of this map view.
	 *
	 * Will discard all the tiles already loaded using the old provider.
	 */
	public setHeightProvider(heightProvider: MapProvider): void
	{
		if (heightProvider !== this.heightProvider) 
		{
			this.heightProvider = heightProvider;
			this.clear();
		}
	}

	/**
	 * Clears all tiles from memory and reloads data. Used when changing the provider.
	 *
	 * Should be called manually if any changed to the provider are made without setting the provider.
	 */
	public clear(): any
	{
		this.traverse(function(children: Object3D): void
		{
			// @ts-ignore
			if (children.childrenCache) 
			{
				// @ts-ignore
				children.childrenCache = null;
			}

			// @ts-ignore
			if (children.initialize) 
			{
				// @ts-ignore
				children.initialize();
			}
		});

		return this;
	}

	/**
	 * Get map meta data from server if supported.
	 */
	public getMetaData(): void
	{
		this.provider.getMetaData();
	}

	public raycast(raycaster: Raycaster, intersects: any[]): boolean
	{
		return false;
	}
}
