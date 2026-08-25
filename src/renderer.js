import * as THREE from 'three';
// try to import WebGPURenderer (if available in three examples). We'll fallback gracefully.
let WebGPURenderer;
try {
  // dynamic import — may fail if not present in package
  // eslint-disable-next-line
  WebGPURenderer = (await import('three/examples/jsm/renderers/WebGPURenderer.js')).WebGPURenderer;
} catch(e){ WebGPURenderer = null; }

export class Renderer {
  constructor(canvas, settings){
    this.canvas = canvas;
    this.settings = settings;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 2000);
    this.renderer = null;
  }

  async init(){
    // try WebGPU
    if (WebGPURenderer && navigator.gpu) {
      try {
        this.renderer = new WebGPURenderer({canvas: this.canvas});
        this.renderer.setSize(innerWidth, innerHeight);
        console.info('Using WebGPU renderer');
      } catch(e){
        console.warn('WebGPU renderer failed, falling back to WebGL2', e);
        this._initWebGL();
      }
    } else {
      this._initWebGL();
    }

    this.scene.background = new THREE.Color(0x070709);

    // simple hemispheric + directional for cinematic look
    const hemi = new THREE.HemisphereLight(0xaaaaaa, 0x080808, 0.5);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(5,10,2);
    dir.castShadow = true;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 100;
    dir.shadow.mapSize.set(2048,2048);
    this.scene.add(dir);
  }

  _initWebGL(){
    const options = {canvas: this.canvas, antialias: true, powerPreference: 'high-performance'};
    this.renderer = new THREE.WebGLRenderer(options);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.domElement.style.touchAction = 'none';
    window.addEventListener('resize', ()=> this.onResize());
  }

  onResize(){
    const w = innerWidth, h=innerHeight;
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h);
  }

  render(){
    this.renderer.render(this.scene, this.camera);
  }
}
