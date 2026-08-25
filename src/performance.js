export class Performance {
  constructor(){
    this.fpsEl = document.getElementById('fps');
    this._frames = 0; this._last = performance.now(); this._fps=0;
  }

  update(){
    this._frames++;
    if(performance.now() - this._last > 500){
      this._fps = Math.round(this._frames * 1000 / (performance.now()-this._last));
      this._last = performance.now();
      this._frames = 0;
      if(this.fpsEl) {
        if(document.getElementById('fps').classList.contains('hidden')) return;
        this.fpsEl.innerText = `${this._fps} FPS`;
      }
    }
  }
}
