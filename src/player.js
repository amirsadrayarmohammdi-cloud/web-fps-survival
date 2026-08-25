import * as THREE from 'three';

export class Player {
  constructor(camera, scene, input, world, settings){
    this.camera = camera;
    this.scene = scene;
    this.input = input;
    this.world = world;
    this.settings = settings;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.position = new THREE.Vector3(0,1.6,5);
    this.camera.position.copy(this.position);

    this.speed = 2.2; // walk meters/sec
    this.sprintMultiplier = 1.8;
    this.crouchMultiplier = 0.5;
    this.heightStanding = 1.6;
    this.heightCrouch = 1.0;

    this.headBobTimer = 0;
    this.breathTimer = 0;

    this.noiseLevel = 0;

    this.reset();
  }

  reset(){
    this.position.set(0, this.heightStanding, 5);
    this.yaw = 0; this.pitch = 0;
    this.camera.position.copy(this.position);
  }

  update(dt){
    const md = this.input.consumeMouseDelta();
    this.yaw -= md.x;
    this.pitch = Math.max(-1.2, Math.min(1.2, this.pitch - md.y));
    this.camera.rotation.set(this.pitch, this.yaw, 0);

    const forward = this.input.move.forward;
    const right = this.input.move.right;
    const sprint = this.input.sprint;
    const crouch = this.input.crouch;

    const isMoving = (forward !== 0 || right !==0);
    let currentSpeed = this.speed * (sprint ? this.sprintMultiplier : 1.0) * (crouch ? this.crouchMultiplier : 1.0);
    this.direction.set(0,0,0);
    // compute forward vector
    const quat = new THREE.Quaternion();
    quat.setFromEuler(new THREE.Euler(0, this.yaw, 0));
    const fwd = new THREE.Vector3(0,0,-1).applyQuaternion(quat);
    const rgt = new THREE.Vector3(1,0,0).applyQuaternion(quat);
    this.direction.addScaledVector(fwd, forward);
    this.direction.addScaledVector(rgt, right);
    if(this.direction.lengthSq()>0) this.direction.normalize();

    const moveDelta = this.direction.clone().multiplyScalar(currentSpeed*dt);
    this.position.add(moveDelta);
    this.camera.position.copy(this.position).y = crouch ? this.heightCrouch : this.heightStanding;

    // noise estimation
    this.noiseLevel = (isMoving ? (sprint ? 1.0 : 0.5) : 0.1) * (crouch ? 0.3 : 1.0);

    // simple collision clamp with world boundaries
    this.world.clampPosition(this.position);
  }

  getWorldPosition(){
    return this.position.clone();
  }

  serialize(){
    return {
      pos: [this.position.x,this.position.y,this.position.z],
      yaw: this.yaw,
      pitch: this.pitch
    };
  }

  restore(state){
    if(!state) return;
    const [x,y,z] = state.pos || [0,1.6,5];
    this.position.set(x,y,z);
    this.yaw = state.yaw || 0;
    this.pitch = state.pitch || 0;
    this.camera.position.copy(this.position);
    this.camera.rotation.set(this.pitch,this.yaw,0);
  }
}
