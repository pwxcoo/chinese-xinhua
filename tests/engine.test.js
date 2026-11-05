import {fallback} from '../web/fallback.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {generate,boardOf,cellsOf,key,settings,solved} from '../web/engine.js';
import {vocabulary} from '../web/vocabulary.js';
for(let level=1;level<=30;level++) test(`关卡 ${level}: 合法布局、确定生成、答案判定`,()=>{
 const p=generate(level), board=boardOf(p.words), config=settings[p.difficulty];
 assert.equal(p.words.length,config.count);
 assert.deepEqual(p,generate(level));
 assert.deepEqual(p,fallback[level-1]);
 assert.ok(p.width<=config.size&&p.height<=config.size);
 assert.equal(new Set(p.words.map(w=>w.word)).size,p.words.length);
 const expected=new Map();
 for(const w of p.words){
  assert.ok(vocabulary.some(v=>v.word===w.word));
  assert.ok(!w.clue.includes(w.word));
  assert.ok(cellsOf(w).some(c=>board.get(key(c.x,c.y)).words.length>1));
  for(const c of cellsOf(w)){
   const k=key(c.x,c.y);if(expected.has(k))assert.equal(expected.get(k),c.char);expected.set(k,c.char);
  }
 }
 for(const [k,c] of board){assert.ok(c.words.length<=2);assert.equal(new Set(c.words.map(w=>w.dir)).size,c.words.length);}
 // Every maximal horizontal/vertical run of two or more cells must be a declared entry.
 for(const dir of ['across','down'])for(const c of board.values()){
  const dx=dir==='across'?1:0,dy=1-dx;
  if(board.has(key(c.x-dx,c.y-dy)))continue;
  let x=c.x,y=c.y,run='';while(board.has(key(x,y))){run+=board.get(key(x,y)).char;x+=dx;y+=dy;}
  if(run.length>1)assert.ok(p.words.some(w=>w.dir===dir&&w.x===c.x&&w.y===c.y&&w.word===run),`意外词串 ${run}`);
 }
 const visited=new Set([p.words[0].id]);let changed=true;while(changed){changed=false;for(const c of board.values())if(c.words.some(w=>visited.has(w.id)))for(const w of c.words)if(!visited.has(w.id)){visited.add(w.id);changed=true;}}
 assert.equal(visited.size,p.words.length);
 for(const [k,char] of Object.entries(p.given))assert.equal(board.get(k).char,char);
 assert.ok(!solved(p,p.given));assert.ok(solved(p,Object.fromEntries(expected)));
 const incorrect=Object.fromEntries(expected);incorrect[expected.keys().next().value]='错';assert.ok(!solved(p,incorrect));
});
test('拒绝越界关卡',()=>{for(const value of [0,31,-1,1.5,NaN])assert.throws(()=>generate(value));});
