export class Inventory {
  constructor(){
    this.slots = {};
  }
  add(item){ this.slots[item.id] = item; }
  has(id){ return !!this.slots[id]; }
  serialize(){ return { slots: this.slots }; }
  restore(s){ if(s) this.slots = s.slots || {}; }
}
