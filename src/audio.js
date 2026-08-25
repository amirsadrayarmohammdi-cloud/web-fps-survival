// A small Web Audio manager with panner support
export class AudioManager {
  constructor(){
    this.ctx = null;
    this.buffers = {};
    this.sources = {};
    this.panners = {};
  }

  async init(){
    if(this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    // create master gain
    this.master = this.ctx.createGain();
    this.master.gain.value = 1.0;
    this.master.connect(this.ctx.destination);

    // load a couple sample sounds (placeholders: generated or very small)
    // We'll create very small oscillator buffers for footsteps/alert as placeholders
    this.buffers['enemy_alert'] = this._sineBeepBuffer(440,0.2);
    this.buffers['footstep'] = this._sineBeepBuffer(220,0.08);
    // create panner for enemy
    this.panners['enemy'] = this.ctx.createPanner();
    this.panners['enemy'].panningModel = 'HRTF';
    this.panners['enemy'].refDistance = 1;
    this.panners['enemy'].rolloffFactor = 1.2;
    this.panners['enemy'].connect(this.master);
  }

  _sineBeepBuffer(freq, duration=0.2){
    const sr = this.ctx.sampleRate;
    const len = Math.floor(sr * duration);
    const buf = this.ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for(let i=0;i<len;i++){
      data[i] = Math.sin(2*Math.PI*freq*(i/sr)) * Math.exp(-3*(i/len));
    }
    return buf;
  }

  play(name, opts={}){
    const b = this.buffers[name];
    if(!b) return;
    const s = this.ctx.createBufferSource();
    s.buffer = b;
    const g = this.ctx.createGain();
    g.gain.value = opts.volume ?? 1.0;
    s.connect(g);
    // panner routing
    if(opts.panner){
      g.connect(opts.panner);
    } else {
      g.connect(this.master);
    }
    s.start();
  }

  setEntityPosition(key, pos){
    if(!this.panners[key]) return;
    this.panners[key].setPosition(pos.x,pos.y,pos.z);
  }

  update(dt){}
}
