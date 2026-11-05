import {fallback} from './fallback.js';
import {generate,boardOf,cellsOf,key,settings,solved} from './engine.js';
const $=id=>document.getElementById(id), storageKey='zijian:v0.1';
let saved={unlocked:1,last:1,games:{}};
try {const data=JSON.parse(localStorage.getItem(storageKey));if(data&&Number.isInteger(data.unlocked)&&data.unlocked>=1&&data.unlocked<=30&&data.games&&typeof data.games==='object') saved={...saved,...data};}catch{}
let puzzle,board,game,word,selected,errors=new Set();
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{$('message').textContent='浏览器无法保存进度，请保持此页面打开。';}}
function load(level){
 level=Math.max(1,Math.min(saved.unlocked,level));
 try { puzzle=generate(level); } catch { puzzle=structuredClone(fallback[level-1]); }
 board=boardOf(puzzle.words);
 const old=saved.games[level];
 game=old&&old.entries&&typeof old.entries==='object'?old:{entries:{},reveals:0,checks:0,started:Date.now()};
 for(const k of Object.keys(game.entries)) if(!board.has(k)||typeof game.entries[k]!=='string'||[...game.entries[k]].length!==1)delete game.entries[k];
 Object.assign(game.entries,puzzle.given);
 saved.games[level]=game;saved.last=level;word=puzzle.words[0];selected=key(word.x,word.y);errors.clear();
 $('difficulty').value=puzzle.difficulty;$('level').replaceChildren();
 for(let i=puzzle.difficulty*10+1;i<=puzzle.difficulty*10+10;i++){const option=new Option(`第 ${String(i).padStart(2,'0')} 关`,i);option.disabled=i>saved.unlocked;$('level').add(option);}
 $('level').value=level;$('chapter').textContent=`CHAPTER ${String(level).padStart(2,'0')} / ${settings[puzzle.difficulty].name}`;
 $('message').textContent=game.finished?'此关已完成，可进入下一关或重新挑战。':'不妨从已经出现的汉字出发。';
 $('answer').value='';render();persist();
}
function selectWord(w,focus=false){word=w;selected=key(w.x,w.y);$('answer').value='';render();if(focus)$('answer').focus();}
function render(){
 const el=$('board');el.replaceChildren();el.style.gridTemplateColumns=`repeat(${puzzle.width},1fr)`;
 const active=new Set(cellsOf(word).map(c=>key(c.x,c.y)));
 for(let y=0;y<puzzle.height;y++) for(let x=0;x<puzzle.width;x++){
  const k=key(x,y),c=board.get(k),button=document.createElement(c?'button':'span');
  if(!c){button.className='void';button.setAttribute('aria-hidden','true');el.append(button);continue;}
  button.className=['cell',puzzle.given[k]?'given':'',active.has(k)?'active-word':'',selected===k?'selected':'',errors.has(k)?'error':''].join(' ');
  button.dataset.key=k;button.tabIndex=selected===k?0:-1;
  const start=puzzle.words.find(w=>w.x===x&&w.y===y);
  if(start){const n=document.createElement('span');n.className='number';n.textContent=start.number;button.append(n);}
  const text=document.createElement('span');text.textContent=game.entries[k]||'';button.append(text);
  button.setAttribute('aria-label',`${y+1}行${x+1}列，${game.entries[k]||'空格'}${puzzle.given[k]?'，预填':''}${errors.has(k)?'，答案错误':''}`);
  button.setAttribute('aria-pressed',String(selected===k));
  button.onclick=()=>{if(selected===k&&c.words.length>1)word=c.words.find(w=>w.id!==word.id)||word;else if(!c.words.some(w=>w.id===word.id))word=c.words[0];selected=k;render();$('answer').focus();};
  el.append(button);
 }
 $('clue-label').textContent=`${word.number} / ${word.dir==='across'?'横向 →':'纵向 ↓'} / ${word.word.length} 字`;
 $('clue-title').textContent=word.dir==='across'?'横向寻词':'纵向寻词';$('clue').textContent=word.clue;
 for(const direction of ['across','down']){
  const list=$(direction+'-list');list.replaceChildren();
  for(const w of puzzle.words.filter(w=>w.dir===direction)){
   const b=document.createElement('button');b.className='clue-item'+(w.id===word.id?' current':'')+(cellsOf(w).every(c=>game.entries[key(c.x,c.y)]===c.char)?' complete':'');
   const number=document.createElement('b');number.textContent=w.number;const text=document.createElement('span');text.textContent=w.clue;b.append(number,text);b.onclick=()=>selectWord(w,true);list.append(b);
  }
 }
 const count=[...board.keys()].filter(k=>game.entries[k]).length;
 $('filled').textContent=`已填写 ${count} / ${board.size} 字`;
 $('progress').textContent=`已通关 ${Object.values(saved.games).filter(g=>g.finished).length} / 30`;
 $('candidate-panel').hidden=puzzle.difficulty!==0;
 const candidates=$('candidates');candidates.replaceChildren();
 if(puzzle.difficulty===0)for(const char of [...new Set(word.word)].sort((a,b)=>a.localeCompare(b,'zh'))){const b=document.createElement('button');b.textContent=char;b.setAttribute('aria-label',`填入${char}`);b.onclick=()=>fill(char);candidates.append(b);}
 document.body.classList.toggle('win',Boolean(game.finished));
}
function complete(){if(!game.finished&&solved(puzzle,game.entries)){
 game.finished=Date.now();saved.unlocked=Math.max(saved.unlocked,Math.min(30,puzzle.level+1));
 const stars=Math.max(1,3-Math.min(2,game.reveals||0));
 $('result').textContent=`${'★'.repeat(stars)}${'☆'.repeat(3-stars)} · 检查 ${game.checks||0} 次 · 揭示 ${game.reveals||0} 字 · 用时 ${Math.max(1,Math.round((game.finished-game.started)/60000))} 分钟`;
 $('next-level').textContent=puzzle.level===30?'全部完成，回到第一关':'继续下一关 →';$('win-dialog').showModal();
 }persist();render();}
function fill(text){
 const chars=[...text.trim()];if(!chars.length)return;
 if(chars.some(c=>!/^\p{Script=Han}$/u.test(c))){$('message').textContent='请输入汉字，支持一次填写完整成语。';return;}
 const cs=cellsOf(word);let index=cs.findIndex(c=>key(c.x,c.y)===selected);
 if(chars.length===cs.length)index=0;
 if(chars.length>cs.length-index){$('message').textContent='输入长度超出当前词条，请选择起点后重试。';return;}
 if(chars.some((char,i)=>{const k=key(cs[index+i].x,cs[index+i].y);return puzzle.given[k]&&puzzle.given[k]!==char;})){$('message').textContent='输入与预填字不一致，请再想一想。';return;}
 chars.forEach((char,i)=>{const k=key(cs[index+i].x,cs[index+i].y);if(!puzzle.given[k])game.entries[k]=char;errors.delete(k);});
 const next=cs.slice(index+chars.length).find(c=>!puzzle.given[key(c.x,c.y)]);if(next)selected=key(next.x,next.y);
 $('answer').value='';$('message').textContent='已填入。借助交叉字，继续寻找线索。';complete();
}
function moveWord(delta){selectWord(puzzle.words[(word.id+delta+puzzle.words.length)%puzzle.words.length]);}
$('enter').onclick=()=>fill($('answer').value);
$('answer').addEventListener('keydown',e=>{if(e.isComposing)return;if(e.key==='Enter'){e.preventDefault();fill(e.target.value);}else if(e.key==='Backspace'&&!e.target.value){e.preventDefault();erase();}});
function erase(){if(!puzzle.given[selected]){delete game.entries[selected];errors.delete(selected);}else{$('message').textContent='预填字不可删除。';}persist();render();}
document.addEventListener('keydown',e=>{
 if(e.isComposing||$('help-dialog').open||$('win-dialog').open)return;
 if(e.target.matches('input,select'))return;
 if(e.key==='Backspace'){e.preventDefault();erase();}
 const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
 if(delta){e.preventDefault();let [x,y]=selected.split(',').map(Number);let c;do{x+=delta[0];y+=delta[1];c=board.get(key(x,y));}while(!c&&x>=0&&x<puzzle.width&&y>=0&&y<puzzle.height);
 if(c){selected=key(x,y);word=c.words.find(w=>w.dir===(delta[0]?'across':'down'))||c.words[0];render();document.querySelector(`[data-key="${selected}"]`).focus();}}
});
$('prev-word').onclick=()=>moveWord(-1);$('next-word').onclick=()=>moveWord(1);
$('check').onclick=()=>{errors=new Set([...board].filter(([k,c])=>game.entries[k]&&game.entries[k]!==c.char).map(([k])=>k));game.checks=(game.checks||0)+1;$('message').textContent=errors.size?`发现 ${errors.size} 个错误，已用边框和 ! 标出。`:'已填写的汉字均正确，继续加油！';persist();render();};
$('reveal').onclick=()=>{if(puzzle.given[selected]||game.entries[selected]===board.get(selected).char){$('message').textContent='此格已有正确答案，请选择其他空格。';return;}game.entries[selected]=board.get(selected).char;game.reveals=(game.reveals||0)+1;errors.delete(selected);$('message').textContent='已揭示一个汉字，本关会记录提示次数。';complete();};
$('reset').onclick=()=>{if(confirm('清除本关填写内容并重新开始？')){delete saved.games[puzzle.level];load(puzzle.level);}};
$('difficulty').onchange=e=>{const base=Number(e.target.value)*10+1;if(base>saved.unlocked){$('message').textContent=`完成前面的关卡，即可解锁第 ${base} 关。`;e.target.value=puzzle.difficulty;}else load(base);};
$('level').onchange=e=>load(Number(e.target.value));
$('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=()=>$('help-dialog').close();$('close-win').onclick=()=>$('win-dialog').close();
$('next-level').onclick=()=>{$('win-dialog').close();load(puzzle.level===30?1:puzzle.level+1);};
load(Number.isInteger(saved.last)?saved.last:1);
