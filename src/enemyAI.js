import * as THREE from 'three';

/*
  Basic state machine: IDLE -> PATROL -> INVESTIGATE -> CHASE -> LOSE_PLAYER -> RETURN
  Uses distance, simple raycast for LOS, and player.noiseLevel for hearing.
*/

export class EnemyAI {
  constructor(owner, scene, world, player, audio){
    this.owner = owner;
    this.scene = scene;
    this.world = world;
    this.player = player;
    this.audio = audio;

    this.raycaster = new THREE.Raycaster();
    this.state = 'PATROL';
    this.patrolPoints = [ new THREE.Vector3(6,0,-6), new THREE.Vector3(2,0,-2), new THREE.Vector3(8,0,0) ];
    this.currentPatrolIndex = 0;
    this.currentVelocity = new THREE.Vector3();
    this.chaseTimer = 0;
    this.memoryPosition = null;
  }

  canSeePlayer(){
    const dir = this.player.getWorldPosition().clone().sub(this.owner.mesh.position);
    const dist = dir.length();
    if(dist > 18) return false;
    dir.normalize();
    this.raycaster.set(this.owner.mesh.position, dir);
    const hits = this.raycaster.intersectObjects(this.scene.children, true);
    if(hits.length>0){
      const first = hits[0];
      const targetPos = this.player.getWorldPosition();
      const dToPlayer = first.point.distanceTo(targetPos);
      // if the first hit is close to player then visible
      if(dToPlayer < 1.2) return true;
      return false;
    }
    return false;
  }

  hearsPlayer(){
    const playerPos = this.player.getWorldPosition();
    const dist = playerPos.distanceTo(this.owner.mesh.position);
    const hearingThreshold = 6 + this.player.noiseLevel * 18;
    return dist < hearingThreshold;
  }

  update(dt){
    // noise + light increases chance to detect
    const sees = this.canSeePlayer();
    const hears = this.hearsPlayer();

    switch(this.state){
      case 'PATROL':
        this._patrol(dt);
        if(sees){
          this.state = 'CHASE';
          this.audio.play('enemy_alert');
        } else if(hears){
          this.state = 'INVESTIGATE';
          this.memoryPosition = this.player.getWorldPosition();
        }
        break;
      case 'INVESTIGATE':
        this._moveTo(this.memoryPosition, dt, 1.0);
        if(sees){
          this.state = 'CHASE';
        } else {
          // if reached, go back to patrol
          if(this.owner.mesh.position.distanceTo(this.memoryPosition) < 1.2) this.state = 'PATROL';
        }
        break;
      case 'CHASE':
        this._moveTo(this.player.getWorldPosition(), dt, 2.2);
        if(!sees && !hears){
          this.chaseTimer += dt;
          if(this.chaseTimer>6){
            this.state = 'LOSE_PLAYER';
            this.chaseTimer = 0;
            this.memoryPosition = this.player.getWorldPosition().clone();
          }
        } else {
          this.chaseTimer = 0;
        }
        break;
      case 'LOSE_PLAYER':
        this._moveTo(this.memoryPosition, dt, 1.2);
        if(this.owner.mesh.position.distanceTo(this.memoryPosition) < 1.2) this.state = 'PATROL';
        if(this.canSeePlayer()) this.state = 'CHASE';
        break;
    }
  }

  _patrol(dt){
    const target = this.patrolPoints[this.currentPatrolIndex];
    this._moveTo(target, dt, 0.8);
    if(this.owner.mesh.position.distanceTo(target) < 0.6){
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
  }

  _moveTo(target, dt, speed){
    const dir = target.clone().sub(this.owner.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if(dist > 0.01){
      dir.normalize();
      this.currentVelocity.copy(dir.multiplyScalar(speed));
    } else this.currentVelocity.set(0,0,0);
  }
}
