// Minimal interaction system: raycast from camera, show hint when looking at interactive objects
import * as THREE from 'three';
export class Interaction {
  constructor(camera, scene){
    this.camera = camera; this.scene = scene;
    this.ray = new THREE.Raycaster();
    this.hovered = null;
    window.addEventListener('keydown',(e)=> { if(e.code==='KeyE') this._tryInteract(); });
  }

  update(){
    const dir = new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion);
    this.ray.set(this.camera.position, dir);
    const hits = this.ray.intersectObjects(this.scene.children, true);
    if(hits.length>0){
      const first = hits[0].object;
      if(first.userData && first.userData.interactive){
        this.hovered = first;
        document.getElementById('interactHint').classList.remove('hidden');
        return;
      }
    }
    this.hovered = null;
    document.getElementById('interactHint').classList.add('hidden');
  }

  _tryInteract(){
    if(!this.hovered) return;
    const obj = this.hovered;
    if(obj.userData.type === 'Door'){
      obj.userData.locked = !obj.userData.locked;
      obj.rotation.y += obj.userData.locked ? Math.PI/2 : -Math.PI/2;
    }
  }
}
