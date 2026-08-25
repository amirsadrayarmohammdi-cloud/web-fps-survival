// Simple IndexedDB wrapper for save/load
export class SaveManager {
  constructor(dbName='fps_survival_save', store='saves'){
    this.dbName = dbName;
    this.store = store;
    this.db = null;
  }

  async _open(){
    if(this.db) return this.db;
    return new Promise((res,rej)=>{
      const r = indexedDB.open(this.dbName, 1);
      r.onupgradeneeded = (e) => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(this.store)) db.createObjectStore(this.store);
      };
      r.onsuccess = (e)=> { this.db = e.target.result; res(this.db); };
      r.onerror = (e)=> rej(e);
    });
  }

  async save(state){
    const db = await this._open();
    return new Promise((res,rej)=>{
      const tx = db.transaction([this.store], 'readwrite');
      const s = tx.objectStore(this.store);
      const req = s.put(state, 'latest');
      req.onsuccess = ()=> res(true);
      req.onerror = (e)=> rej(e);
    });
  }

  async load(){
    const db = await this._open();
    return new Promise((res,rej)=>{
      const tx = db.transaction([this.store], 'readonly');
      const s = tx.objectStore(this.store);
      const req = s.get('latest');
      req.onsuccess = ()=> res(req.result);
      req.onerror = (e)=> rej(e);
    });
  }
}
