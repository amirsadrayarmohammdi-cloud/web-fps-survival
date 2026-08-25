export class UI {
  constructor(){
    this.mainMenu = document.getElementById('main-menu');
    this.hud = document.getElementById('hud');
    this.settingsPanel = document.getElementById('settings-panel');
    this.pauseMenu = document.getElementById('pause-menu');
    this.fpsEl = document.getElementById('fps');

    // bindings
    document.getElementById('new-game').addEventListener('click', ()=> this._onNewGame());
    document.getElementById('continue').addEventListener('click', ()=> this._onContinue());
    document.getElementById('settings-btn').addEventListener('click', ()=> this._onSettings());
    document.getElementById('settings-back').addEventListener('click', ()=> this._onSettingsBack());
    document.getElementById('resume').addEventListener('click', ()=> this._onResume());
    document.getElementById('save-game').addEventListener('click', ()=> this._onSave());
    document.getElementById('load-game').addEventListener('click', ()=> this._onLoad());
    document.getElementById('quit').addEventListener('click', ()=> location.reload());
    this.onTogglePointerLock = null;
  }

  showMainMenu(){ this.mainMenu.classList.remove('hidden'); this.hud.classList.add('hidden'); }
  hideMainMenu(){ this.mainMenu.classList.add('hidden'); this.hud.classList.remove('hidden'); }
  showSettings(){ this.settingsPanel.classList.remove('hidden'); }
  hideSettings(){ this.settingsPanel.classList.add('hidden'); }

  setPaused(p){ if(p) this.pauseMenu.classList.remove('hidden'); else this.pauseMenu.classList.add('hidden'); }

  bindStartNewGame(cb){ this._startCb = cb; }
  bindContinue(cb){ this._contCb = cb; }
  bindSettings(cb){ this._settingsCb = cb; }
  bindSettingsBack(cb){ this._settingsBackCb = cb; }
  bindPause(cb){ document.addEventListener('keydown',(e)=>{ if(e.code==='Escape') cb(); }); }
  bindSave(cb){ document.getElementById('save-game').addEventListener('click', cb); }
  bindLoad(cb){ document.getElementById('load-game').addEventListener('click', cb); }

  notify(msg, ttl=2000){
    // small toast
    const el = document.createElement('div');
    el.style.position='absolute'; el.style.bottom='8%'; el.style.left='50%'; el.style.transform='translateX(-50%)';
    el.style.background='rgba(0,0,0,0.7)'; el.style.padding='8px 12px'; el.style.borderRadius='6px';
    el.style.color='white'; el.style.zIndex=9999; el.innerText = msg;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), ttl);
  }

  _onNewGame(){ if(this._startCb) this._startCb(); }
  _onContinue(){ if(this._contCb) this._contCb(); }
  _onSettings(){ if(this._settingsCb) this._settingsCb(); else this.showSettings(); }
  _onSettingsBack(){ if(this._settingsBackCb) this._settingsBackCb(); else this.hideSettings(); }
  _onResume(){ if(this.onTogglePointerLock) this.onTogglePointerLock(true); this.setPaused(false); }
  _onSave(){}
  _onLoad(){}
}
