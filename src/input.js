export class Input {
  constructor(canvas, settings){
    this.canvas = canvas;
    this.settings = settings;
    this.enabled = false;
    this.pointerLocked = false;
    this.move = { forward:0, right:0 };
    this.sprint = false;
    this.crouch = false;
    this.mouseDelta = {x:0,y:0};

    this._bindEvents();
  }

  _bindEvents(){
    window.addEventListener('keydown',(e)=>{
      if(e.code==='KeyW') this.move.forward=1;
      if(e.code==='KeyS') this.move.forward=-1;
      if(e.code==='KeyA') this.move.right=-1;
      if(e.code==='KeyD') this.move.right=1;
      if(e.shiftKey) this.sprint = true;
      if(e.code==='ControlLeft') this.crouch = true;
      if(e.code==='Escape') document.exitPointerLock();
      if(e.code==='KeyF') document.dispatchEvent(new CustomEvent('toggle-flash'));
    });
    window.addEventListener('keyup',(e)=>{
      if(e.code==='KeyW' && this.move.forward===1) this.move.forward=0;
      if(e.code==='KeyS' && this.move.forward===-1) this.move.forward=0;
      if(e.code==='KeyA' && this.move.right===-1) this.move.right=0;
      if(e.code==='KeyD' && this.move.right===1) this.move.right=0;
      if(!e.shiftKey) this.sprint = false;
      if(e.code==='ControlLeft') this.crouch = false;
    });

    this.canvas.addEventListener('click', ()=> {
      this.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', ()=> {
      this.pointerLocked = !!document.pointerLockElement;
    });

    window.addEventListener('mousemove',(e)=>{
      if(!this.pointerLocked) return;
      const sens = this.settings.get('sensitivity') || 1.0;
      this.mouseDelta.x += e.movementX * 0.002 * sens;
      this.mouseDelta.y += e.movementY * 0.002 * sens;
    });
  }

  requestPointerLock(){
    if(this.canvas.requestPointerLock) this.canvas.requestPointerLock();
  }

  exitPointerLock(){ if (document.exitPointerLock) document.exitPointerLock(); }

  update(dt){
    // reset mouseDelta after reads
  }

  consumeMouseDelta(){
    const d = {...this.mouseDelta};
    this.mouseDelta.x = 0; this.mouseDelta.y = 0;
    return d;
  }
}
