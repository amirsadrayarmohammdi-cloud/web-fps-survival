import { Game } from './game.js';
import { UI } from './ui.js';
import { Settings } from './settings.js';

const ui = new UI();
const settings = new Settings();
const game = new Game({ ui, settings });

async function boot(){
  await game.init();
  ui.bindStartNewGame(()=> game.startNewGame());
  ui.bindContinue(()=> game.continueGame());
  ui.bindSettings(()=> ui.showSettings());
  ui.bindSettingsBack(()=> ui.hideSettings());
  ui.bindPause(()=> game.togglePause());
  ui.bindSave(()=> game.saveGame());
  ui.bindLoad(()=> game.loadGame());
  ui.bindQualityChange((q) => settings.applyPreset(q));
}

boot();
