export class PuzzleManager {
  constructor(world, player){
    this.world = world; this.player = player;
    this.state = {};
  }
  update(dt){}
  serialize(){ return this.state; }
  restore(s){ this.state = s || {}; }
}
