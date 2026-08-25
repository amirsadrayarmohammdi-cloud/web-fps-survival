export class Settings {
  constructor(){
    this.quality = 'HIGH';
    this.storeKey = 'game_settings_v1';
  }

  load(){
    try {
      const s = localStorage.getItem(this.storeKey);
      if(s) Object.assign(this, JSON.parse(s));
    } catch(e){}
  }

  save(){
    try { localStorage.setItem(this.storeKey, JSON.stringify({quality:this.quality})); } catch(e){}
  }

  applyPreset(preset){
    this.quality = preset;
    // apply presets to renderer/settings (placeholder)
    this.save();
    document.getElementById('quality-select').value = preset;
  }

  get(k){
    if(k==='sensitivity') return parseFloat(document.getElementById('sensitivity')?.value || 1.0);
    return null;
  }

  serialize(){ return { quality: this.quality }; }
}
