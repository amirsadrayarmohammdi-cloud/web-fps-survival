import * as THREE from 'three';

export class World {
  constructor(scene, renderer){
    this.scene = scene;
    this.renderer = renderer;
    this._items = [];
    this.bounds = {minX:-20,maxX:20,minZ:-20,maxZ:20};
  }

  buildSampleLevel(){
    // floor
    const floorMat = new THREE.MeshStandardMaterial({color:0x2e2e2e, roughness:1});
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80,80), floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // corridor walls / boxes for obstacles
    const wallMat = new THREE.MeshStandardMaterial({color:0x111111,metalness:0.1,roughness:0.9});
    const boxGeo = new THREE.BoxGeometry(1,2,4);
    for(let i=0;i<8;i++){
      const b = new THREE.Mesh(boxGeo, wallMat);
      b.position.set(-6 + i*1.6,1, -6);
      b.castShadow = true; b.receiveShadow = true;
      this.scene.add(b);
      this._items.push(b);
    }

    // add lightbulb props
    for(let i=0;i<6;i++){
      const p = new THREE.PointLight(0xfff1d6, 0.2, 8);
      p.position.set(-4 + i*2,2.8, -2);
      this.scene.add(p);
    }

    // a locked door (interactive object)
    const doorMat = new THREE.MeshStandardMaterial({color:0x552222, roughness:0.7});
    const door = new THREE.Mesh(new THREE.BoxGeometry(2,3,0.2), doorMat);
    door.position.set(0,1.5,-12);
    door.name = 'door_locked';
    door.userData = { interactive: true, type: 'Door', locked: true };
    this.scene.add(door);
    this._items.push(door);
  }

  clampPosition(pos){
    pos.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, pos.x));
    pos.z = Math.max(this.bounds.minZ, Math.min(this.bounds.maxZ, pos.z));
  }

  update(dt){ /* streaming/LOD would go here */ }

  serialize(){
    // minimal
    return { /* world state like doors */ };
  }
  restore(s){ /* restore world state */ }
}
