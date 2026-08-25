import * as THREE from 'three';

export class Renderer {
  constructor(canvas, settings){
    this.canvas = canvas;
    this.settings = settings;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 2000);
    this.renderer = null;
    this._useWebGPU = false; // WebGPU renderer disabled by default for compatibility
  }

  async init(){
    // NOTE: WebGPURenderer is an examples file that may not be present in the installed
    // three package. Attempting to import it in the bundler can fail (Vite will error)
    // if the file doesn't exist. To keep compatibility across environments we
    // currently fallback to a high-quality WebGL renderer. To enable WebGPU you
    // can manually add the appropriate WebGPU renderer build into the project
    // or install a three release that includes it.

    this._initWebGL();

    this.scene.background = new THREE.Color(0x070709);

    // high quality lighting defaults
    if(!this._useWebGPU){
      this.renderer.physicallyCorrectLights = true;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;
    }

    // simple hemispheric + directional for cinematic look
    const hemi = new THREE.HemisphereLight(0xaaaaaa, 0x080808, 0.5);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,2);
    dir.castShadow = true;
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 200;
    // increase shadow map for high quality (try best available)
    try{ dir.shadow.mapSize.set(4096,4096); }catch(e){ try{ dir.shadow.mapSize.set(2048,2048); }catch(e){} }
    this.scene.add(dir);

    // subtle environment reflection probe (best-effort)
    try{
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
    }catch(e){}

    window.addEventListener('resize', ()=> this.onResize());
  }

  _initWebGL(){
    const options = {canvas: this.canvas, antialias: true, powerPreference: 'high-performance'};
    this.renderer = new THREE.WebGLRenderer(options);
    // limit pixel ratio for better performance on high-DPI displays while keeping quality
    this.renderer.setPixelRatio(window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.domElement.style.touchAction = 'none';
  }

  onResize(){
    const w = innerWidth, h=innerHeight;
    this.camera.aspect = w/h;
    this.camera.updateProjectionMatrix();
    if(this.renderer) this.renderer.setSize(w,h);
  }

  render(){
    if(this.renderer) this.renderer.render(this.scene, this.camera);
  }
}
