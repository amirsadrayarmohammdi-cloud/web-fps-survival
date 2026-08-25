import { Renderer } from './renderer.js';
import { Player } from './player.js';
import { Input } from './input.js';
import { World } from './world.js';
import { Flashlight } from './flashlight.js';
import { Enemy } from './enemy.js';
import { AudioManager } from './audio.js';
import { SaveManager } from './save.js';
import { Performance } from './performance.js';

export class Game {
  constructor({ ui, settings }){
    this.ui = ui;
    this.settings = settings;
    this.running = false;
    this.paused = false;

    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas, settings);
    this.input = new Input(this.canvas, settings);
    this.audio = new AudioManager();
    this.performance = new Performance();
    this.save = new SaveManager();

    this.lastTime = 0;
  }

  async init(){
    await this.renderer.init();
    this.scene = this.renderer.scene;
    this.camera = this.renderer.camera;

    this.world = new World(this.scene, this.renderer);
    this.player = new Player(this.camera, this.scene, this.input, this.world, this.settings);
    this.flashlight = new Flashlight(this.scene, this.camera, this.player);
    this.enemy = new Enemy(this.scene, this.world, this.player, this.audio);

    this.ui.showMainMenu();

    // wire UI toggles
    this.ui.onTogglePointerLock = (requested) => {
      if(requested) this.input.requestPointerLock();
      else this.input.exitPointerLock();
    };

    // restore settings
    this.settings.load();
    this.settings.applyPreset(this.settings.quality);

    // initial audio
    this.audio.init();
    this.world.buildSampleLevel();

    // connect audio panner for enemy etc.
  }

  startNewGame(){
    this.ui.hideMainMenu();
    this.running = true;
    this.lastTime = performance.now();
    this.player.reset();
    this.loop(this.lastTime);
    this.input.requestPointerLock();
  }

  continueGame(){
    this.ui.hideMainMenu();
    this.save.load().then(state=>{
      if(state){
        this.player.restore(state.player);
        this.world.restore(state.world);
        this.enemy.restore(state.enemy);
        this.ui.hideMainMenu();
        this.running = true;
        this.lastTime = performance.now();
        this.loop(this.lastTime);
      } else {
        this.startNewGame();
      }
    });
  }

  togglePause(){
    this.paused = !this.paused;
    this.ui.setPaused(this.paused);
    if(!this.paused){
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  async loop(t){
    if(!this.running || this.paused) return;
    const dt = Math.min(0.05, (t - this.lastTime)/1000);
    this.lastTime = t;

    this.input.update(dt);
    this.player.update(dt);
    this.flashlight.update(dt);
    this.enemy.update(dt);
    this.world.update(dt);
    this.audio.update(dt);
    this.performance.update();

    this.renderer.render();

    requestAnimationFrame((n)=> this.loop(n));
  }

  async saveGame(){
    const state = {
      player: this.player.serialize(),
      world: this.world.serialize(),
      enemy: this.enemy.serialize(),
      settings: this.settings.serialize()
    };
    await this.save.save(state);
    this.ui.notify('Game saved');
  }

  async loadGame(){
    const state = await this.save.load();
    if(state){
      this.player.restore(state.player);
      this.world.restore(state.world);
      this.enemy.restore(state.enemy);
      this.ui.notify('Loaded save');
    } else this.ui.notify('No save found');
  }
}
