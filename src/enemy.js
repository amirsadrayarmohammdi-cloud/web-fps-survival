import * as THREE from 'three';
import { EnemyAI } from './enemyAI.js';

export class Enemy {
  constructor(scene, world, player, audio){
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.audio = audio;

    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2,2.2,1), new THREE.MeshStandardMaterial({color:0x333333, metalness:0.8, roughness:0.6}));
    this.mesh.position.set(6,1.1,-6);
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    this.speed = 1.2;
    this.ai = new EnemyAI(this, scene, world, player, audio);

    this.lastKnownPlayer = null;
  }

  update(dt){
    this.ai.update(dt);
    // simple transform
    this.mesh.position.addScaledVector(this.ai.currentVelocity || new THREE.Vector3(), dt);
    // rotate toward velocity
    if(this.ai.currentVelocity && this.ai.currentVelocity.lengthSq()>0.001){
      const dir = this.ai.currentVelocity.clone().normalize();
      this.mesh.lookAt(this.mesh.position.clone().add(dir));
    }
    // update audio panner
    this.audio.setEntityPosition('enemy', this.mesh.position);
  }

  serialize(){ return { pos: [this.mesh.position.x,this.mesh.position.y,this.mesh.position.z], state: this.ai.state }; }
  restore(s){ if(!s) return; const [x,y,z] = s.pos || [6,1.1,-6]; this.mesh.position.set(x,y,z); this.ai.state = s.state || this.ai.state; }
}
