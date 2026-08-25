import * as THREE from 'three';
export class Flashlight {
  constructor(scene, camera, player){
    this.scene = scene;
    this.camera = camera;
    this.player = player;

    this.battery = 100;
    this.on = true;
    this.spot = new THREE.SpotLight(0xfff7dc, 2, 20, Math.PI/8, 0.4, 1);
    this.spot.castShadow = true;
    this.scene.add(this.spot);
    this.spot.target.position.set(0,0,-1);
    this.scene.add(this.spot.target);

    this.flickerTimer = 0;

    document.addEventListener('toggle-flash', ()=> this.toggle());
  }

  toggle(){
    this.on = !this.on;
    // small toggle sound event
    const evt = new CustomEvent('flash-toggle', { detail: { on: this.on }});
    document.dispatchEvent(evt);
  }

  update(dt){
    // attach spotlight to camera
    this.spot.position.copy(this.camera.position);
    const forward = new THREE.Vector3(0,0,-1).applyQuaternion(this.camera.quaternion);
    this.spot.target.position.copy(this.camera.position).add(forward);

    if(this.on && this.battery>0){
      const drain = 2 * dt * (this.player.input.sprint ? 1.2 : 1.0);
      this.battery = Math.max(0, this.battery - drain);
      if(this.battery < 10){
        // sporadic flicker
        this.flickerTimer -= dt;
        if(this.flickerTimer <= 0){
          if(Math.random() < 0.4) this.spot.intensity = 0.2 + Math.random()*0.5;
          else this.spot.intensity = 1.5;
          this.flickerTimer = 0.2 + Math.random()*1.2;
        }
      } else {
        this.spot.intensity = 1.6;
      }
    } else {
      this.spot.intensity = 0;
    }

    // broadcast battery to UI
    document.getElementById('battery-val').innerText = Math.round(this.battery);
  }

  useBattery(amount){
    this.battery = Math.max(0, this.battery - amount);
  }

  serialize(){ return { battery: this.battery, on: this.on }; }
  restore(s){ if(!s) return; this.battery = s.battery || this.battery; this.on = s.on ?? this.on; }
}
