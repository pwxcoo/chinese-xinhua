import { vocabulary } from './vocabulary.js';
export const key = (x,y) => `${x},${y}`;
export const settings = [
  {name:'初入字林', count:4, size:9, given:.48},
  {name:'渐入佳境', count:7, size:12, given:.26},
  {name:'纵横高手', count:10, size:15, given:.12},
];
function random(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15,1|seed); t ^= t + Math.imul(t ^ t >>> 7,61|t); return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
export function cellsOf(w) { return [...w.word].map((char,i)=>({x:w.x+(w.dir==='across'?i:0),y:w.y+(w.dir==='down'?i:0),char})); }
export function boardOf(words) {
  const map=new Map();
  for(const w of words) for(const c of cellsOf(w)) { const k=key(c.x,c.y); if(!map.has(k)) map.set(k,{...c,words:[]}); map.get(k).words.push(w); }
  return map;
}
function canPlace(w,words,size) {
 const board=boardOf(words), cells=cellsOf(w), dx=w.dir==='across'?1:0,dy=1-dx;
 if(cells.some(c=>Math.abs(c.x)>size||Math.abs(c.y)>size)) return false;
 if(board.has(key(w.x-dx,w.y-dy))||board.has(key(cells.at(-1).x+dx,cells.at(-1).y+dy))) return false;
 let crosses=0;
 for(const c of cells) {
  const old=board.get(key(c.x,c.y));
  if(old) {if(old.char!==c.char||old.words.some(v=>v.dir===w.dir)) return false; crosses++;}
  else if(board.has(key(c.x-dy,c.y-dx))||board.has(key(c.x+dy,c.y+dx))) return false;
 }
 const all=[...board.values(),...cells];
 return crosses>0 && Math.max(...all.map(c=>c.x))-Math.min(...all.map(c=>c.x))<size && Math.max(...all.map(c=>c.y))-Math.min(...all.map(c=>c.y))<size;
}
export function generate(level=1) {
 if(!Number.isInteger(level)||level<1||level>30) throw new Error('关卡应为 1–30');
 const difficulty=Math.floor((level-1)/10), config=settings[difficulty], rng=random(level*7919);
 let best=[];
 for(let attempt=0;attempt<32;attempt++) {
  const pool=vocabulary.map(v=>({...v,sort:rng()})).sort((a,b)=>a.sort-b.sort);
  const words=[{...pool[0],x:0,y:0,dir:'across'}];
  while(words.length<config.count) {
   const choices=[];
   for(const v of pool) {
    if(words.some(w=>w.word===v.word)) continue;
    for(const base of words) for(let a=0;a<base.word.length;a++) for(let b=0;b<v.word.length;b++) {
     if(base.word[a]!==v.word[b]) continue;
     const dir=base.dir==='across'?'down':'across';
     const w={...v,dir,x:base.x+(base.dir==='across'?a:0)-(dir==='across'?b:0),y:base.y+(base.dir==='down'?a:0)-(dir==='down'?b:0)};
     if(canPlace(w,words,config.size)) choices.push(w);
    }
   }
   if(!choices.length) break;
   words.push(choices[Math.floor(rng()*choices.length)]);
  }
  if(words.length>best.length) best=words;
  if(best.length===config.count) break;
 }
 if(best.length<config.count) throw new Error('无法生成完整关卡');
 const cells=[...boardOf(best).values()], minX=Math.min(...cells.map(c=>c.x)),minY=Math.min(...cells.map(c=>c.y));
 best.forEach(w=>{w.x-=minX;w.y-=minY;});
 best.sort((a,b)=>a.y-b.y||a.x-b.x);
 let n=0;const numbers=new Map();best.forEach((w,i)=>{const k=key(w.x,w.y);if(!numbers.has(k))numbers.set(k,++n);w.number=numbers.get(k);w.id=i;});
 const board=boardOf(best), given={};
 for(const [k,c] of board) if(rng()<config.given) given[k]=c.char;
 for(const w of best) {const cs=cellsOf(w);if(!cs.some(c=>given[key(c.x,c.y)])) {const c=cs[Math.floor(rng()*cs.length)];given[key(c.x,c.y)]=c.char;}}
 return {level,difficulty,words:best,given,width:Math.max(...[...board.values()].map(c=>c.x))+1,height:Math.max(...[...board.values()].map(c=>c.y))+1};
}
export function solved(puzzle,entries) {return [...boardOf(puzzle.words)].every(([k,c])=>entries[k]===c.char);}
