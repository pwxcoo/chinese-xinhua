const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_URL || 'http://127.0.0.1:8000');
 await page.locator('.cell').first().waitFor();
 const state=await page.evaluate(async()=>{const {generate,boardOf}=await import('/web/engine.js');const p=generate(1);return {p,cells:[...boardOf(p.words)].map(([k,c])=>({k,char:c.char}))};});
 assert.equal(await page.locator('.clue-item').count(),4);
 await page.screenshot({path:'/tmp/zijian-desktop.png',fullPage:true});
 await page.locator('#help').click();assert.equal(await page.locator('#help-dialog').evaluate(el=>el.open),true);await page.locator('#close-help').click();
 // Enter a wrong character and verify explicit error feedback.
 const blank=state.cells.find(c=>!state.p.given[c.k]);
 await page.locator(`[data-key="${blank.k}"]`).click();await page.locator('#answer').fill('错');await page.locator('#enter').click();await page.locator('#check').click();
 assert.equal(await page.locator('.cell.error').count(),1);
 await page.reload();assert.equal(await page.locator(`[data-key="${blank.k}"] > span:last-child`).innerText(),'错');
 await page.locator(`[data-key="${blank.k}"]`).click();await page.locator('#reveal').click();assert.ok((await page.locator(`[data-key="${blank.k}"]`).innerText()).includes(blank.char));
 // Fill each original entry through the visible input, including shared cells.
 for(const w of state.p.words){await page.locator('.clue-item').filter({hasText:w.clue}).first().click();await page.locator('#answer').fill(w.word);await page.locator('#enter').click();}
 assert.equal(await page.locator('#win-dialog').evaluate(el=>el.open),true);
 assert.match(await page.locator('#result').innerText(),/检查 1 次 · 揭示 1 字/);
 await page.locator('#next-level').click();assert.equal(await page.locator('#level').inputValue(),'2');
 await page.reload();assert.equal(await page.locator('#level').inputValue(),'2');
 // Mobile layout and selection across all 30 puzzles.
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'/tmp/zijian-mobile.png',fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('zijian:v0.1'));s.unlocked=30;localStorage.setItem('zijian:v0.1',JSON.stringify(s));});
 await page.reload();
 for(const difficulty of ['0','1','2']){await page.locator('#difficulty').selectOption(difficulty);for(let n=Number(difficulty)*10+1;n<=Number(difficulty)*10+10;n++){await page.locator('#level').selectOption(String(n));assert.equal(await page.locator('.clue-item').count(),[4,7,10][Number(difficulty)]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}}
 assert.deepEqual(errors,[]);
 console.log('PASS: desktop/mobile, all 30 puzzles, input, error checking, reveal, victory, unlock, reload persistence, help, no console errors or horizontal overflow.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
